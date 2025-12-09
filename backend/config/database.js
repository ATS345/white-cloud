import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import {
  DB_DIALECT,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV,
} from './envConfig.js';

// 确保database目录存在
const dbDirectory = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// 创建Sequelize实例，使用内存数据库作为后备选项
let sequelize;

try {
  const sequelizeConfig = {
    dialect: DB_DIALECT,
    logging: NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };

  // SQLite配置
  if (DB_DIALECT === 'sqlite') {
    // 使用内存数据库，避免文件系统和构建工具问题
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // 正确的内存数据库配置
      logging: NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  } else {
    // 非SQLite数据库配置
    sequelizeConfig.timezone = '+08:00';
    sequelizeConfig.host = DB_HOST;
    sequelizeConfig.port = DB_PORT;
    sequelizeConfig.database = DB_NAME;
    sequelizeConfig.username = DB_USER;
    sequelizeConfig.password = DB_PASSWORD;

    sequelize = new Sequelize(sequelizeConfig);
  }

  // 测试数据库连接（可选，失败不影响服务器启动）
  const testConnection = async () => {
    try {
      await sequelize.authenticate();
      logger.info('数据库连接成功');
    } catch (error) {
      logger.warn('数据库连接失败，服务器将继续运行但部分功能可能受限:', error.message);
      logger.debug('详细错误:', error);
    }
  };

  // 延迟执行连接测试，允许服务器先启动
  setTimeout(testConnection, 1000);
} catch (error) {
  logger.error('创建数据库连接时发生错误:', error.message);
  logger.warn('服务器将继续启动，但数据库功能将不可用');

  // 创建一个模拟的sequelize实例，避免服务器完全崩溃
  sequelize = {
    authenticate: async () => Promise.reject(new Error('数据库连接不可用')),
    sync: async () => Promise.resolve(),
    define: () => ({}),
    models: {},
    model: () => ({}),
    transaction: () => ({ commit: () => {}, rollback: () => {} }),
    QueryTypes: {
      SELECT: 'SELECT', INSERT: 'INSERT', UPDATE: 'UPDATE', DELETE: 'DELETE',
    },
  };
}

export default sequelize;
