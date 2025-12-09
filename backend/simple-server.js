// 简单的服务器脚本，只启动 Express 服务器，不进行模型初始化
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 配置中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查路由
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '木鱼游戏平台API运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 测试路由，返回模拟的游戏列表
app.get('/api/v1/games', (req, res) => {
  res.status(200).json({
    success: true,
    message: '游戏列表获取成功',
    data: {
      games: [
        {
          id: 1,
          title: '测试游戏1',
          description: '这是一个测试游戏',
          price: 99.99,
          discount_price: 79.99,
          release_date: '2025-12-01T00:00:00Z',
          rating: 4.5,
          review_count: 100,
          categories: [
            { id: 1, name: '动作' },
            { id: 2, name: '冒险' },
          ],
          tags: [
            { id: 1, name: '开放世界' },
            { id: 2, name: '单人游戏' },
          ],
        },
        {
          id: 2,
          title: '测试游戏2',
          description: '这是另一个测试游戏',
          price: 129.99,
          discount_price: null,
          release_date: '2025-12-05T00:00:00Z',
          rating: 4.8,
          review_count: 150,
          categories: [
            { id: 3, name: '角色扮演' },
          ],
          tags: [
            { id: 3, name: '多人在线' },
            { id: 4, name: 'PVP' },
          ],
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1,
      },
    },
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 简单服务器启动成功！');
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV}`);
  console.log('\n按 Ctrl+C 停止服务器');
});
