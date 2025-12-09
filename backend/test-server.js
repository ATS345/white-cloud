// 简单的测试脚本，用于检查服务器的基本功能
import express from 'express';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 配置中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '木鱼游戏平台API运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 测试服务器启动成功！');
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log('\n按 Ctrl+C 停止服务器');
});
