// 网关服务 - 主入口文件
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';
import { registerService, getHealthyServiceInstances, getNextServiceInstance } from './config/consul.js';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
// 安全中间件
app.use(helmet());

// CORS中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));

// 日志中间件
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream: logger.stream }));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: '请求过于频繁，请稍后再试',
    },
  },
});

app.use(limiter);

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '未提供认证令牌',
      },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无效的认证令牌',
        },
      });
    }

    req.user = user;
    next();
  });
};

// 服务映射配置
const serviceMap = {
  '/api/v1/auth': 'user-service',
  '/api/v1/users': 'user-service',
  '/api/v1/games': 'game-service',
  '/api/v1/cart': 'cart-service',
  '/api/v1/orders': 'payment-service',
  '/api/v1/payments': 'payment-service',
  '/api/v1/library': 'download-service',
  '/api/v1/reviews': 'review-service',
  '/api/v1/developer': 'developer-service',
  '/api/v1/recommendations': 'recommendation-service',
};

// 需要认证的路由
const protectedRoutes = [
  '/api/v1/users',
  '/api/v1/cart',
  '/api/v1/orders',
  '/api/v1/payments',
  '/api/v1/library',
  '/api/v1/reviews',
  '/api/v1/developer',
  '/api/v1/recommendations/personalized',
];

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '网关服务运行正常',
    timestamp: new Date().toISOString(),
    service: 'gateway-service',
    version: '1.0.0',
  });
});

// API文档路由
app.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API网关文档',
    services: Object.keys(serviceMap).map(path => ({
      path,
      service: serviceMap[path],
    })),
  });
});

// 服务代理中间件
app.use('*', async (req, res) => {
  try {
    logger.info(`[Gateway] 收到请求: ${req.method} ${req.originalUrl}`);
    
    // 获取请求路径
    const url = req.originalUrl;
    
    // 检查是否需要认证
    const isProtected = protectedRoutes.some(route => url.startsWith(route));
    if (isProtected && !req.headers.authorization) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌',
        },
      });
    }
    
    // 认证处理（如果需要）
    if (isProtected) {
      authenticateToken(req, res, () => {});
      if (res.headersSent) {
        return;
      }
    }
    
    // 查找对应的服务
    let targetService = null;
    let servicePath = '';
    
    for (const [path, service] of Object.entries(serviceMap)) {
      if (url.startsWith(path)) {
        targetService = service;
        servicePath = url.replace(path, '');
        break;
      }
    }
    
    if (!targetService) {
      logger.error(`[Gateway] 未找到对应的服务: ${url}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '请求的资源不存在',
        },
      });
    }
    
    // 从Consul获取健康的服务实例
    const instances = await getHealthyServiceInstances(targetService);
    if (instances.length === 0) {
      logger.error(`[Gateway] 服务${targetService}没有健康的实例`);
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `服务${targetService}暂时不可用`,
        },
      });
    }
    
    // 使用负载均衡策略选择服务实例
    const instance = getNextServiceInstance(targetService, instances);
    if (!instance) {
      logger.error(`[Gateway] 无法选择服务实例: ${targetService}`);
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `服务${targetService}暂时不可用`,
        },
      });
    }
    
    // 构建目标URL
    const targetUrl = `http://${instance.address}:${instance.port}${servicePath}`;
    logger.info(`[Gateway] 转发请求到: ${targetUrl}`);
    
    // 转发请求
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        'X-Forwarded-For': req.ip,
        'X-Forwarded-Proto': req.protocol,
        'X-Forwarded-Host': req.get('host'),
        'X-Service-Id': instance.id,
      },
      data: req.body,
      params: req.query,
      timeout: 5000,
    });
    
    // 转发响应
    res.status(response.status).json(response.data);
    logger.info(`[Gateway] 请求处理成功: ${req.method} ${req.originalUrl} -> ${response.status}`);
  } catch (error) {
    logger.error(`[Gateway] 请求处理失败: ${error.message}`);
    
    // 处理不同类型的错误
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: {
          code: 'GATEWAY_TIMEOUT',
          message: '请求超时，请稍后再试',
        },
      });
    }
    
    if (error.response) {
      // 服务返回了错误响应
      return res.status(error.response.status).json(error.response.data);
    }
    
    // 其他错误
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '网关服务器内部错误',
      },
    });
  }
});

// 404处理
app.use((req, res) => {
  logger.error(`[Gateway] 未找到资源: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在',
    },
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`[Gateway] 未捕获的错误: ${err.message}`, err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '网关服务器内部错误',
    },
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 注册服务到Consul
    await registerService();
    
    // 启动Express服务器
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`[Gateway] 服务器已启动，端口: ${PORT}`);
      logger.info(`[Gateway] 环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`[Gateway] 健康检查地址: http://0.0.0.0:${PORT}/health`);
      logger.info(`[Gateway] API文档地址: http://0.0.0.0:${PORT}/docs`);
    });
  } catch (error) {
    logger.error(`[Gateway] 服务器启动失败: ${error.message}`);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 监听进程终止信号
process.on('SIGINT', async () => {
  logger.info('[Gateway] 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('[Gateway] 收到终止信号，正在关闭服务器...');
  process.exit(0);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('[Gateway] 未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Gateway] 未处理的Promise拒绝:', reason);
  logger.debug('[Gateway] Promise:', promise);
  process.exit(1);
});