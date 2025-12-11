import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import net from 'net';
import { execSync } from 'child_process';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { PORT, CORS_ORIGIN, NODE_ENV } from './config/envConfig.js';

// 导入路由
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import gameLibraryRoutes from './routes/gameLibraryRoutes.js';
import developerRoutes from './routes/developerRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// 导入错误处理中间件
import errorHandler from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

// 初始化Express应用
export const app = express();

// 配置中间件
// 安全中间件
app.use(helmet());

// CORS中间件
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));

// 日志中间件
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// 解析请求体
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

// 根路径重定向到API文档
app.get('/', (req, res) => {
  res.redirect('/api/v1/docs');
});

// Swagger API文档路由
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 注册API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/games', gameRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/download', downloadRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/library', gameLibraryRoutes);
app.use('/api/v1/developer', developerRoutes);
app.use('/api/v1/cart', cartRoutes);

// 处理404错误 - 抛出NotFoundError，由全局错误处理中间件处理
app.use((req, res, next) => {
  next(new NotFoundError(`请求的资源不存在: ${req.originalUrl}`, 'RESOURCE_NOT_FOUND'));
});

// 全局错误处理中间件
app.use(errorHandler);

// 启动服务器和初始化数据库
console.log('开始启动服务器...');

// 端口冲突检测函数
const checkPortInUse = (port) => new Promise((resolve) => {
  const server = net.createServer();

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // 端口被占用，获取占用进程ID
      try {
        const output = execSync(`netstat -ano | findstr :${port}`).toString();
        const matches = output.match(/LISTENING\s+([0-9]+)/);
        const pid = matches ? matches[1] : '未知';
        resolve({ inUse: true, pid, port });
      } catch (e) {
        resolve({ inUse: true, pid: '未知', port });
      }
    } else {
      resolve({ inUse: false, port });
    }
  });

  server.once('listening', () => {
    server.close();
    resolve({ inUse: false, port });
  });

  server.listen(port);
});

// 启动服务器，实现端口冲突检测与处理
export const startServer = async () => {
  try {
    // 检测端口是否被占用
    const portStatus = await checkPortInUse(PORT);

    if (portStatus.inUse) {
      // 端口被占用，输出详细错误信息
      const conflictTime = new Date().toISOString();
      console.error('\n❌ 服务器启动失败 - 端口冲突');
      console.error('📋 详细错误报告:');
      console.error(`  - 冲突端口: ${PORT}`);
      console.error(`  - 占用进程ID: ${portStatus.pid}`);
      console.error(`  - 冲突时间: ${conflictTime}`);
      console.error('  - 错误代码: EADDRINUSE');
      console.error('  - 错误信息: 地址已被使用');
      console.error('\n💡 解决方案:');
      console.error('  1. 终止占用该端口的进程:');
      console.error(`     taskkill /F /PID ${portStatus.pid}`);
      console.error('  2. 修改配置文件，使用其他可用端口');
      console.error('  3. 重启电脑，释放所有端口');
      console.error('\n🔍 命令行检测端口占用:');
      console.error(`     netstat -ano | findstr :${PORT}`);
      process.exit(1);
    }

    // 端口可用，启动服务器
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 服务器启动成功！');
      console.log(`📡 服务器地址: http://0.0.0.0:${PORT}`);
      console.log(`📡 本地访问地址: http://localhost:${PORT}`);
      console.log(`📝 API文档地址: http://localhost:${PORT}/api/v1/docs`);
      console.log(`🔧 环境: ${NODE_ENV}`);
      console.log(`✅ 端口: ${PORT} (已验证可用)`);
      console.log('\n按 Ctrl+C 停止服务器');
    });

    return server;
  } catch (error) {
    console.error('\n❌ 服务器启动失败:');
    console.error(`  - 错误信息: ${error.message}`);
    console.error(`  - 错误堆栈: ${error.stack}`);
    process.exit(1);
  }
};

// app对象已在定义时导出，用于测试
// 启动服务器的逻辑将移到一个单独的入口文件中
