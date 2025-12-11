// 用户服务 - 主入口文件
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import redisClient from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 配置中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '用户服务运行正常',
    timestamp: new Date().toISOString(),
    service: 'user-service',
    version: '1.0.0',
  });
});

// 注册路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// 404处理
app.use((req, res, next) => {
  next(new NotFoundError(`请求的资源不存在: ${req.originalUrl}`, 'RESOURCE_NOT_FOUND'));
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info(`[USER-SERVICE] 服务器已启动，端口: ${PORT}`);
  logger.info(`[USER-SERVICE] 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 监听进程终止信号
process.on('SIGINT', async () => {
  logger.info('[USER-SERVICE] 正在关闭服务器...');

  try {
    // 关闭Redis连接
    if (redisClient && redisClient.disconnect) {
      await redisClient.disconnect();
      logger.info('[USER-SERVICE] Redis连接已关闭');
    }

    process.exit(0);
  } catch (error) {
    logger.error('[USER-SERVICE] 关闭服务器时发生错误:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('[USER-SERVICE] 收到终止信号，正在关闭服务器...');

  try {
    // 关闭Redis连接
    if (redisClient && redisClient.disconnect) {
      await redisClient.disconnect();
      logger.info('[USER-SERVICE] Redis连接已关闭');
    }

    process.exit(0);
  } catch (error) {
    logger.error('[USER-SERVICE] 关闭服务器时发生错误:', error);
    process.exit(1);
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('[USER-SERVICE] 未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('[USER-SERVICE] 未处理的Promise拒绝:', reason);
  logger.debug('[USER-SERVICE] Promise:', promise);
  process.exit(1);
});
