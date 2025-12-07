import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建日志目录
const logDirectory = path.join(__dirname, '..', 'logs');

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({
    stack: true
  }),
  winston.format.splat(),
  winston.format.json()
);

// 定义控制台日志格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.simple()
);

// 创建日常轮转的文件传输
const fileTransport = new DailyRotateFile({
  filename: path.join(logDirectory, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // 保留14天的日志文件
  format: logFormat
});

// 创建错误日志的文件传输
const errorTransport = new DailyRotateFile({
  filename: path.join(logDirectory, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // 错误日志保留30天
  level: 'error',
  format: logFormat
});

// 创建访问日志的文件传输
const accessTransport = new DailyRotateFile({
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // 访问日志保留14天
  format: logFormat
});

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    fileTransport,
    errorTransport,
    accessTransport,
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'exceptions.log'),
      maxFiles: '30d'
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'rejections.log'),
      maxFiles: '30d'
    })
  ]
});

// 导出日志记录器
export default logger;