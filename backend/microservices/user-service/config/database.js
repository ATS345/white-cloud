// 用户服务 - 数据库配置
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

// 数据库配置
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'muyu_game_user',
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.info('[DATABASE]', msg) : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '5', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
  },
  timezone: '+08:00',
};

// 读写分离配置
const readReplicaConfig = {
  host: process.env.DB_REPLICA_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.DB_REPLICA_PORT || process.env.DB_PORT || 3306,
  username: process.env.DB_REPLICA_USER || process.env.DB_USER || 'root',
  password: process.env.DB_REPLICA_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'muyu_game_user',
};

// 创建主数据库连接
let sequelize;

const initDatabase = async () => {
  try {
    logger.info('[DATABASE] 开始初始化数据库连接...');
    logger.info('[DATABASE] 主数据库配置：', dbConfig);

    // 创建主数据库连接
    const connection = new Sequelize(dbConfig);
    sequelize = connection;

    // 测试连接
    await connection.authenticate();
    logger.info('[DATABASE] 主数据库连接成功');

    // 如果配置了只读副本，则添加只读副本
    if (process.env.DB_REPLICA_HOST) {
      logger.info('[DATABASE] 只读副本配置：', readReplicaConfig);
      connection.addHook('beforeFind', (options) => {
        const newOptions = { ...options };
        newOptions.replica = true;
        return newOptions;
      });

      // 添加只读副本
      connection.options.replication = {
        write: dbConfig,
        read: [readReplicaConfig],
      };

      logger.info('[DATABASE] 只读副本配置成功');
    }

    return connection;
  } catch (error) {
    logger.error('[DATABASE] 数据库连接失败：', error);
    logger.error('[DATABASE] 错误堆栈：', error.stack);
    throw error;
  }
};

// 初始化数据库连接
initDatabase().catch((error) => {
  logger.error('[DATABASE] 数据库连接初始化失败，程序将退出：', error);
  process.exit(1);
});

// 创建一个不可变的导出对象，包含getter方法
const sequelizeInstance = {
  get sequelize() {
    return sequelize;
  },
  getInstance: () => sequelize,
};

// 导出不可变的对象
export default sequelizeInstance;
