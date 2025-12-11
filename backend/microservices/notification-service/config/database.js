// 数据库配置 - 使用Sequelize ORM
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'notification_service_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+08:00',
  },
);

/**
 * 测试数据库连接
 */
const testDBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DATABASE CONFIG] 数据库连接成功');
  } catch (error) {
    console.error('[DATABASE CONFIG] 数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 导出数据库配置
export {
  sequelize,
  testDBConnection,
};
