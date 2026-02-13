"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const games_1 = __importDefault(require("./routes/games"));
const categories_1 = __importDefault(require("./routes/categories"));
const orders_1 = __importDefault(require("./routes/orders"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const stats_1 = __importDefault(require("./routes/stats"));
// 加载环境变量
dotenv_1.default.config();
// 创建Express应用
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中间件配置
// 优化CORS配置
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://your-production-domain.com'
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24小时
}));
// 优化JSON解析
app.use(express_1.default.json({
    limit: '10mb', // 限制请求体大小
    strict: true // 只接受数组和对象
}));
// 优化URL编码解析
app.use(express_1.default.urlencoded({
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
app.use('/api/auth', auth_1.default);
// 游戏路由
app.use('/api/games', games_1.default);
// 分类路由
app.use('/api/categories', categories_1.default);
// 订单路由
app.use('/api/orders', orders_1.default);
// 评论路由
app.use('/api', reviews_1.default);
// 统计路由
app.use('/api', stats_1.default);
// 404处理
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// 错误处理中间件
app.use((err, req, res, next) => {
    // 只在开发环境打印错误堆栈
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    // 统一错误响应
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json(Object.assign({ error: message }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
});
// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
