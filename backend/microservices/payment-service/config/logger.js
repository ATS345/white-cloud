// 支付服务 - 日志配置
import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// 确保日志目录存在
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 日志格式配置
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  format.json(),
);

// 日志级别配置
const logLevel = process.env.LOG_LEVEL || 'info';

// 创建日志记录器
const logger = createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: {
    service: 'payment-service',
  },
  transports: [
    // 控制台输出
    new transports.Console({
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        }),
      ),
      level: logLevel,
    }),
    // 错误日志文件
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    }),
    // 所有日志文件
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    }),
  ],
});

// 导出日志记录器
export default logger;
