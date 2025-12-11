// 游戏服务 - 主服务器文件
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './config/logger.js';
import redisService from './config/redis.js';

// 游戏列表路由
import {
  getGameList,
  getGameDetail,
  getCategories,
  getTags,
  getPopularGames,
  getNewGames,
} from './controllers/gameListController.js';

// 游戏管理路由
import {
  createGame,
  updateGame,
  deleteGame,
  batchDeleteGames,
  updateGameStatus,
  getDeveloperGames,
} from './controllers/gameManagementController.js';

// 初始化 Express 应用
const app = express();

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查 Redis 连接
    await redisService.get('health-check');

    logger.info('[GameService] 健康检查通过');
    return res.status(200).json({
      status: 'UP',
      service: 'game-service',
      timestamp: new Date().toISOString(),
      dependencies: {
        redis: 'UP',
      },
    });
  } catch (error) {
    logger.error(`[GameService] 健康检查失败: ${error.message}`);
    return res.status(503).json({
      status: 'DOWN',
      service: 'game-service',
      timestamp: new Date().toISOString(),
      dependencies: {
        redis: 'DOWN',
      },
    });
  }
});

// 公共游戏路由
app.get('/games', getGameList);
app.get('/games/:id', getGameDetail);
app.get('/categories', getCategories);
app.get('/tags', getTags);
app.get('/games/popular', getPopularGames);
app.get('/games/new', getNewGames);

// 游戏管理路由
app.post('/games', createGame);
app.put('/games/:id', updateGame);
app.delete('/games/:id', deleteGame);
app.delete('/games/batch', batchDeleteGames);
app.patch('/games/:id/status', updateGameStatus);
app.get('/developers/:developerId/games', getDeveloperGames);

// 错误处理中间件
app.use((err, req, res) => {
  logger.error(`[GameService] 未捕获的错误: ${err.message}`, { stack: err.stack });
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误',
      details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    },
  });
});

// 404 处理
app.use('*', (req, res) => {
  logger.warn(`[GameService] 404 - 请求路径: ${req.originalUrl}`);
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在',
    },
  });
});

// 启动服务器
const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  logger.info(`[GameService] 服务器已启动，监听端口: ${PORT}`);
  logger.info(`[GameService] 环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`[GameService] 健康检查端点: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('[GameService] 收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('[GameService] 服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('[GameService] 收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('[GameService] 服务器已关闭');
    process.exit(0);
  });
});

// 未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`[GameService] 未处理的 Promise 拒绝: ${reason}`, { promise });
});

// 未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error(`[GameService] 未捕获的异常: ${error.message}`, { stack: error.stack });
  process.exit(1);
});
