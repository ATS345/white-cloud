// 游戏服务 - 数据库配置
import { Sequelize } from 'sequelize';
import logger from './logger.js';

// 从环境变量获取数据库配置
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'games_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

// 创建Sequelize实例
let sequelize;

// 初始化数据库连接
const initDatabase = () => {
  try {
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: DB_DIALECT,
      logging: (msg) => logger.debug(`[Sequelize] ${msg}`),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      timezone: '+08:00',
    });

    logger.info('[Database] 数据库连接配置成功');
  } catch (error) {
    logger.error('[Database] 数据库连接配置失败:', error.message);
    throw error;
  }
};

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('[Database] 数据库连接成功');
    return true;
  } catch (error) {
    logger.error('[Database] 数据库连接失败:', error.message);
    return false;
  }
};

// 同步数据库模型
const syncModels = async () => {
  try {
    // 使用force: false，不会删除已存在的表
    await sequelize.sync({ force: false, alter: true });
    logger.info('[Database] 数据库模型同步成功');
  } catch (error) {
    logger.error('[Database] 数据库模型同步失败:', error.message);
    throw error;
  }
};

// 初始化数据库
initDatabase();

// 导出数据库实例和相关函数
const sequelizeInstance = {
  get sequelize() {
    return sequelize;
  },
  getInstance: () => sequelize,
  testConnection: testDatabaseConnection,
  syncModels,
};

export default sequelizeInstance;
