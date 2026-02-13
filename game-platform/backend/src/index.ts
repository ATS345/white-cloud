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
// 优化CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24小时
}));

// 优化JSON解析
app.use(express.json({
  limit: '10mb', // 限制请求体大小
  strict: true // 只接受数组和对象
}));

// 优化URL编码解析
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// 响应头优化中间件
app.use((req, res, next) => {
  // 缓存控制
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  // 压缩
  res.setHeader('Content-Encoding', 'gzip');
  
  // 安全头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// 健康检查接口
app.get('/health', (req, res) => {
  // 快速响应，不使用JSON序列化
  res.status(200).send('OK');
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
  // 只在开发环境打印错误堆栈
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // 统一错误响应
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});