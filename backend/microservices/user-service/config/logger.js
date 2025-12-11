// 用户服务 - 日志配置
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

// 日志级别
const logLevel = process.env.LOG_LEVEL || 'info';

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 日志传输
const transports = [
  // 控制台传输
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}] ${info.message}`;
      })
    ),
  }),
];

// 文件传输（生产环境）
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );
}

// 创建日志实例
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf((info) => {
          return `${info.timestamp} [${info.level}] ${info.message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: logFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf((info) => {
          return `${info.timestamp} [${info.level}] ${info.message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: logFormat,
    }),
  ],
});

export default logger;
