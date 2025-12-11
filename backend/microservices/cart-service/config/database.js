// 购物车服务 - 数据库配置
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

// 获取当前文件所在目录的绝对路径
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// 创建日志目录
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 初始化Sequelize实例
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: (msg) => {
      // 将数据库日志写入文件
      fs.appendFileSync(
        path.join(logsDir, 'database.log'),
        `${new Date().toISOString()} - ${msg}\n`
      );
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+08:00', // 设置为北京时间
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('[CART-SERVICE] 数据库连接成功');
  } catch (error) {
    console.error('[CART-SERVICE] 数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 导出Sequelize实例和连接测试函数
export { sequelize, testConnection };
