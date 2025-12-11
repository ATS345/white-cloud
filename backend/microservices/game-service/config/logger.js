// 游戏服务 - 日志配置
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建日志目录路径
const logDir = path.join(__dirname, '..', 'logs');

// 日志级别：debug, info, warn, error
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({
      stack: true,
    }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: 'game-service',
  },
  transports: [
    // 错误日志输出到文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      zippedArchive: true,
    }),
    // 所有日志输出到文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      zippedArchive: true,
    }),
  ],
});

// 开发环境下，日志输出到控制台
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// 日志流，用于morgan中间件
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;