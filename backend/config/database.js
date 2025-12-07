import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// 加载环境变量
dotenv.config()

// 确保database目录存在
const dbDirectory = path.join(process.cwd(), 'database')
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true })
}

// 创建Sequelize实例，使用内存数据库作为后备选项
let sequelize;

try {
  const dialect = process.env.DB_DIALECT || 'sqlite';
  const sequelizeConfig = {
    dialect: dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  // SQLite配置
  if (dialect === 'sqlite') {
    // 使用内存数据库，避免文件系统和构建工具问题
    sequelizeConfig.dialectOptions = {
      filename: ':memory:'
    };
  } else {
    // 非SQLite数据库配置
    sequelizeConfig.timezone = '+08:00';
    sequelizeConfig.host = process.env.DB_HOST;
    sequelizeConfig.port = process.env.DB_PORT;
    sequelizeConfig.database = process.env.DB_NAME;
    sequelizeConfig.username = process.env.DB_USER;
    sequelizeConfig.password = process.env.DB_PASSWORD;
  }

  sequelize = new Sequelize(sequelizeConfig);
  
  // 测试数据库连接（可选，失败不影响服务器启动）
  const testConnection = async () => {
    try {
      await sequelize.authenticate();
      console.log('数据库连接成功');
    } catch (error) {
      console.warn('数据库连接失败，服务器将继续运行但部分功能可能受限:', error.message);
      console.debug('详细错误:', error);
    }
  };

  // 延迟执行连接测试，允许服务器先启动
  setTimeout(testConnection, 1000);
} catch (error) {
  console.error('创建数据库连接时发生错误:', error.message);
  console.warn('服务器将继续启动，但数据库功能将不可用');
  
  // 创建一个模拟的sequelize实例，避免服务器完全崩溃
  sequelize = {
    authenticate: async () => Promise.reject(new Error('数据库连接不可用')),
    sync: async () => Promise.resolve(),
    define: () => ({}),
    models: {},
    model: () => ({}),
    transaction: () => ({ commit: () => {}, rollback: () => {} }),
    QueryTypes: { SELECT: 'SELECT', INSERT: 'INSERT', UPDATE: 'UPDATE', DELETE: 'DELETE' }
  };
}

export default sequelize