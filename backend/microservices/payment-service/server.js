// 支付服务 - 主入口文件
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import redisClient from './config/redis.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';
import { sequelize } from './config/database.js';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3002;

// 配置中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 导入Prometheus中间件
import expressPrometheusMiddleware from 'express-prometheus-middleware';

// Prometheus中间件配置
app.use(expressPrometheusMiddleware({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 2, 5, 10],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  authenticate: async (req, res) => {
    return true; // 暂时允许所有请求访问metrics
  },
}));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '支付服务运行正常',
    timestamp: new Date().toISOString(),
    service: 'payment-service',
    version: '1.0.0',
  });
});

// 注册路由
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/refunds', refundRoutes);

// 404处理
app.use((req, res, next) => {
  next(new NotFoundError(`请求的资源不存在: ${req.originalUrl}`, 'RESOURCE_NOT_FOUND'));
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info(`[PAYMENT-SERVICE] 服务器已启动，端口: ${PORT}`);
  logger.info(`[PAYMENT-SERVICE] 环境: ${process.env.NODE_ENV || 'development'}`);
  
  // 同步数据库模型
  sequelize.sync({ alter: process.env.NODE_ENV === 'development' }) // 在开发环境下自动更新表结构
    .then(() => {
      logger.info('[PAYMENT-SERVICE] 数据库模型同步完成');
    })
    .catch((error) => {
      logger.error('[PAYMENT-SERVICE] 数据库模型同步失败:', error);
    });
});

// 监听进程终止信号
process.on('SIGINT', async () => {
  logger.info('[PAYMENT-SERVICE] 正在关闭服务器...');

  try {
    // 关闭Redis连接
    if (redisClient && redisClient.disconnect) {
      await redisClient.disconnect();
      logger.info('[PAYMENT-SERVICE] Redis连接已关闭');
    }

    // 关闭数据库连接
    if (sequelize && sequelize.close) {
      await sequelize.close();
      logger.info('[PAYMENT-SERVICE] 数据库连接已关闭');
    }

    process.exit(0);
  } catch (error) {
    logger.error('[PAYMENT-SERVICE] 关闭服务器时发生错误:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('[PAYMENT-SERVICE] 收到终止信号，正在关闭服务器...');

  try {
    // 关闭Redis连接
    if (redisClient && redisClient.disconnect) {
      await redisClient.disconnect();
      logger.info('[PAYMENT-SERVICE] Redis连接已关闭');
    }

    // 关闭数据库连接
    if (sequelize && sequelize.close) {
      await sequelize.close();
      logger.info('[PAYMENT-SERVICE] 数据库连接已关闭');
    }

    process.exit(0);
  } catch (error) {
    logger.error('[PAYMENT-SERVICE] 关闭服务器时发生错误:', error);
    process.exit(1);
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('[PAYMENT-SERVICE] 未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('[PAYMENT-SERVICE] 未处理的Promise拒绝:', reason);
  logger.debug('[PAYMENT-SERVICE] Promise:', promise);
  process.exit(1);
});

// 导出app对象，用于测试
export { app };
