// 游戏服务 - 主服务器文件
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './config/logger.js';
import redisService from './config/redis.js';
import setupSwagger from './config/swagger.js';

// 中间件
import { authenticateJWT, ROLES } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';

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

// 错误处理中间件
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// 初始化 Express 应用
const app = express();

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 设置 Swagger API 文档
setupSwagger(app);

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

// 公共游戏路由 - 不需要认证，应用基础速率限制
const publicRateLimit = rateLimit({ windowMs: 60000, max: 100 });
app.get('/games', publicRateLimit, getGameList);
app.get('/games/:id', publicRateLimit, getGameDetail);
app.get('/categories', publicRateLimit, getCategories);
app.get('/tags', publicRateLimit, getTags);
app.get('/games/popular', publicRateLimit, getPopularGames);
app.get('/games/new', publicRateLimit, getNewGames);

// 游戏管理路由 - 需要认证和权限控制
const adminRateLimit = rateLimit({ windowMs: 60000, max: 50 });
const developerRateLimit = rateLimit({ windowMs: 60000, max: 30 });

// 开发者和管理员都可以创建游戏
app.post('/games', developerRateLimit, authenticateJWT([ROLES.DEVELOPER, ROLES.ADMIN]), createGame);

// 开发者和管理员都可以更新游戏
app.put('/games/:id', developerRateLimit, authenticateJWT([ROLES.DEVELOPER, ROLES.ADMIN]), updateGame);

// 开发者和管理员都可以删除游戏
app.delete('/games/:id', developerRateLimit, authenticateJWT([ROLES.DEVELOPER, ROLES.ADMIN]), deleteGame);

// 只有管理员可以批量删除游戏
app.delete('/games/batch', adminRateLimit, authenticateJWT([ROLES.ADMIN]), batchDeleteGames);

// 只有管理员可以更新游戏状态
app.patch('/games/:id/status', adminRateLimit, authenticateJWT([ROLES.ADMIN]), updateGameStatus);

// 开发者和管理员都可以获取开发者游戏列表
app.get('/developers/:developerId/games', developerRateLimit, authenticateJWT([ROLES.DEVELOPER, ROLES.ADMIN]), getDeveloperGames);

// 404 处理
app.use('*', notFoundHandler);

// 全局错误处理
app.use(errorHandler);

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
