import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import reviewRoutes from './routes/reviews';
import statsRoutes from './routes/stats';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Game Platform API is running' });
});

// API路由
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to Game Platform API' });
});

// 认证路由
app.use('/api/auth', authRoutes);

// 游戏路由
app.use('/api/games', gameRoutes);

// 分类路由
app.use('/api/categories', categoryRoutes);

// 订单路由
app.use('/api/orders', orderRoutes);

// 评论路由
app.use('/api', reviewRoutes);

// 统计路由
app.use('/api', statsRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});