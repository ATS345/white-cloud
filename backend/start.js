// 服务器启动入口文件
// 这个文件用于生产环境和开发环境启动服务器
import { startServer } from './server.js';
import { syncModels } from './models/index.js';
import logger from './config/logger.js';
import redisClient from './config/redis.js';
import sequelize from './config/database.js';

// 异步自执行函数，启动服务器和初始化数据库
(async () => {
  try {
    // 启动服务器
    const server = await startServer();

    // 异步初始化数据库模型和关联（不阻塞服务器启动）
    console.log('正在异步初始化数据库模型和关联...');
    await syncModels().catch((error) => {
      console.error('数据库模型和关联初始化失败:', error);
      console.error('错误堆栈:', error.stack);
      console.warn('⚠️  数据库模型和关联初始化失败，但服务器已启动');
    });

    // 监听进程终止信号，确保资源正确释放
    const handleShutdown = async () => {
      logger.info('[SERVER] 正在关闭服务器...');

      try {
        // 关闭Redis连接
        if (redisClient && redisClient.disconnect) {
          await redisClient.disconnect();
          logger.info('[REDIS] Redis连接已关闭');
        }

        // 关闭Sequelize连接
        if (sequelize && sequelize.close) {
          await sequelize.close();
          logger.info('[DATABASE] 数据库连接已关闭');
        }

        // 关闭HTTP服务器
        server.close(() => {
          logger.info('[SERVER] 服务器已成功关闭');
          process.exit(0);
        });
      } catch (error) {
        logger.error(`[SERVER SHUTDOWN ERROR] ${error.message}`);
        process.exit(1);
      }
    };

    // 监听SIGINT和SIGTERM信号
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);

    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('未捕获的异常:', error);
      console.error('错误堆栈:', error.stack);
      console.warn('⚠️  发生未捕获的异常，但服务器将继续运行');
    });

    // 监听未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('未处理的Promise拒绝:', reason);
      console.error('Promise:', promise);
      console.warn('⚠️  发生未处理的Promise拒绝，但服务器将继续运行');
    });
  } catch (error) {
    console.error('服务器启动过程中发生严重错误:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
})();
