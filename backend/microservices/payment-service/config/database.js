// 支付服务 - 数据库配置
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'payment_service_db',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[DATABASE] ${msg}`);
    }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
};

// 创建数据库连接
const sequelize = new Sequelize(dbConfig);

// 测试数据库连接
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('[DATABASE] 数据库连接成功');
  } catch (error) {
    logger.error('[DATABASE] 数据库连接失败:', error);
    logger.error('[DATABASE] 错误详情:', error.message);
    process.exit(1);
  }
};

// 导出数据库连接和测试函数
export {
  sequelize,
  testDbConnection,
};
