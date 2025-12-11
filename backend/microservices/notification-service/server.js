// 通知服务 - 主入口文件
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notificationRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';
import { sequelize, testDBConnection } from './config/database.js';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3004;

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
    message: '通知服务运行正常',
    timestamp: new Date().toISOString(),
    service: 'notification-service',
    version: '1.0.0',
  });
});

// API文档路由
app.get('/api-docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: '通知服务API文档',
    endpoints: {
      'POST /api/v1/notifications': '创建通知',
      'GET /api/v1/notifications/user/:userId': '获取用户通知列表',
      'GET /api/v1/notifications/:id': '获取单个通知详情',
      'PUT /api/v1/notifications/:id/read': '标记通知为已读',
      'PUT /api/v1/notifications/read-multiple': '批量标记通知为已读',
      'DELETE /api/v1/notifications/:id': '删除通知',
      'DELETE /api/v1/notifications/delete-multiple': '批量删除通知',
      'GET /api/v1/notifications/user/:userId/unread-count': '获取未读通知数量',
      'DELETE /api/v1/notifications/user/:userId/clear-read': '清除所有已读通知',
    },
  });
});

// 注册路由
app.use('/api/v1/notifications', notificationRoutes);

// 404处理
app.use((req, res, next) => {
  next(new NotFoundError(`请求的资源不存在: ${req.originalUrl}`, 'RESOURCE_NOT_FOUND'));
});

// 错误处理中间件
app.use(errorHandler);

/**
 * 启动服务器
 */
const startServer = async () => {
  try {
    // 测试数据库连接
    await testDBConnection();

    // 同步数据库模型
    await sequelize.sync({
      alter: process.env.NODE_ENV === 'development', // 在开发环境下自动更新表结构
    });

    console.log('[NOTIFICATION SERVICE] 数据库模型同步完成');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`[NOTIFICATION SERVICE] 服务器已启动，端口: ${PORT}`);
      console.log(`[NOTIFICATION SERVICE] 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[NOTIFICATION SERVICE] 健康检查: http://localhost:${PORT}/health`);
      console.log(`[NOTIFICATION SERVICE] API文档: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('[NOTIFICATION SERVICE] 服务器启动失败:', error.message);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 监听进程终止信号
process.on('SIGINT', async () => {
  console.log('[NOTIFICATION SERVICE] 正在关闭服务器...');

  try {
    // 关闭数据库连接
    await sequelize.close();
    console.log('[NOTIFICATION SERVICE] 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('[NOTIFICATION SERVICE] 关闭服务器时发生错误:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('[NOTIFICATION SERVICE] 收到终止信号，正在关闭服务器...');

  try {
    // 关闭数据库连接
    await sequelize.close();
    console.log('[NOTIFICATION SERVICE] 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('[NOTIFICATION SERVICE] 关闭服务器时发生错误:', error.message);
    process.exit(1);
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('[NOTIFICATION SERVICE] 未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('[NOTIFICATION SERVICE] 未处理的Promise拒绝:', reason);
  console.error('[NOTIFICATION SERVICE] Promise:', promise);
  process.exit(1);
});

// 导出app对象，用于测试
export { app };
