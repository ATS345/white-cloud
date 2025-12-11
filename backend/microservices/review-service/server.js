// 评价服务 - 主入口文件
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';
import { sequelize, testDBConnection } from './config/database.js';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3003;

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
    message: '评价服务运行正常',
    timestamp: new Date().toISOString(),
    service: 'review-service',
    version: '1.0.0',
  });
});

// API文档路由
app.get('/api-docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: '评价服务API文档',
    endpoints: {
      'POST /api/v1/reviews': '创建评论',
      'GET /api/v1/reviews/game/:gameId': '获取游戏评论列表',
      'GET /api/v1/reviews/user/:userId': '获取用户评论列表',
      'GET /api/v1/reviews/:id': '获取单个评论详情',
      'PUT /api/v1/reviews/:id': '更新评论',
      'DELETE /api/v1/reviews/:id': '删除评论',
      'POST /api/v1/reviews/:id/like': '点赞评论',
      'POST /api/v1/reviews/:id/dislike': '踩评论',
      'GET /api/v1/reviews/game/:gameId/stats': '获取游戏评论统计'
    }
  });
});

// 注册路由
app.use('/api/v1/reviews', reviewRoutes);

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
      alter: process.env.NODE_ENV === 'development' // 在开发环境下自动更新表结构
    });

    console.log('[REVIEW SERVICE] 数据库模型同步完成');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`[REVIEW SERVICE] 服务器已启动，端口: ${PORT}`);
      console.log(`[REVIEW SERVICE] 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[REVIEW SERVICE] 健康检查: http://localhost:${PORT}/health`);
      console.log(`[REVIEW SERVICE] API文档: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('[REVIEW SERVICE] 服务器启动失败:', error.message);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 监听进程终止信号
process.on('SIGINT', async () => {
  console.log('[REVIEW SERVICE] 正在关闭服务器...');

  try {
    // 关闭数据库连接
    await sequelize.close();
    console.log('[REVIEW SERVICE] 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('[REVIEW SERVICE] 关闭服务器时发生错误:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('[REVIEW SERVICE] 收到终止信号，正在关闭服务器...');

  try {
    // 关闭数据库连接
    await sequelize.close();
    console.log('[REVIEW SERVICE] 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('[REVIEW SERVICE] 关闭服务器时发生错误:', error.message);
    process.exit(1);
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('[REVIEW SERVICE] 未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('[REVIEW SERVICE] 未处理的Promise拒绝:', reason);
  console.error('[REVIEW SERVICE] Promise:', promise);
  process.exit(1);
});
