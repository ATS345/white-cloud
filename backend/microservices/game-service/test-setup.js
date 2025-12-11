// 游戏服务 - 基础设置测试脚本
import { Model, Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

console.log('=== 游戏服务基础设置测试 ===');
console.log('环境变量加载成功');
console.log(`PORT: ${process.env.PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);

// 测试 Sequelize 连接
async function testSequelizeConnection() {
  try {
    console.log('\n=== 测试 Sequelize 连接 ===');

    // 创建临时 Sequelize 实例进行测试
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: (msg) => console.log(`[Sequelize] ${msg}`),
      },
    );

    // 测试连接
    await sequelize.authenticate();
    console.log('✅ Sequelize 连接成功！');

    // 关闭连接
    await sequelize.close();
    console.log('Sequelize 连接已关闭');
    return true;
  } catch (error) {
    console.error('❌ Sequelize 连接失败:', error.message);
    return false;
  }
}

// 测试 Redis 连接
async function testRedisConnection() {
  try {
    console.log('\n=== 测试 Redis 连接 ===');

    // 动态导入 Redis 模块
    const { createClient } = await import('redis');

    // 创建 Redis 客户端
    const redis = createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB, 10),
    });

    // 连接 Redis
    await redis.connect();
    console.log('✅ Redis 连接成功！');

    // 测试 Redis 操作
    await redis.set('test-key', 'test-value', { EX: 10 });
    const value = await redis.get('test-key');
    console.log(`Redis 读写测试成功，获取值: ${value}`);

    // 关闭连接
    await redis.disconnect();
    console.log('Redis 连接已关闭');
    return true;
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message);
    return false;
  }
}

// 测试模型定义
function testModelDefinition() {
  try {
    console.log('\n=== 测试模型定义 ===');

    // 定义一个简单的测试模型
    class TestModel extends Model {
      static testMethod() {
        return '模型方法测试成功';
      }
    }

    console.log('✅ 模型类定义成功');
    console.log(`模型方法测试: ${TestModel.testMethod()}`);
    return true;
  } catch (error) {
    console.error('❌ 模型定义失败:', error.message);
    return false;
  }
}

// 主测试函数
async function main() {
  console.log('\n开始运行测试...\n');

  const results = {
    modelTest: testModelDefinition(),
    sequelizeTest: await testSequelizeConnection(),
    redisTest: await testRedisConnection(),
  };

  console.log('\n=== 测试结果汇总 ===');
  console.log(`模型定义测试: ${results.modelTest ? '✅ 通过' : '❌ 失败'}`);
  console.log(`Sequelize 连接测试: ${results.sequelizeTest ? '✅ 通过' : '❌ 失败'}`);
  console.log(`Redis 连接测试: ${results.redisTest ? '✅ 通过' : '❌ 失败'}`);

  const allPassed = Object.values(results).every((result) => result);
  console.log(`\n总体测试结果: ${allPassed ? '✅ 全部通过' : '❌ 部分失败'}`);

  return allPassed;
}

// 运行测试
main().catch((error) => {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
}).finally(() => {
  console.log('\n=== 测试结束 ===');
  process.exit(0);
});
