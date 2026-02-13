# 游戏平台前端架构设计

## 1. 技术栈

### 1.1 核心技术
- **框架**: React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **路由**: React Router 7
- **状态管理**: Zustand (轻量级状态管理)
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **性能监控**: Web Vitals

### 1.2 第三方依赖
- **@stripe/stripe-js**: 支付集成
- **react-icons**: 图标库
- **web-vitals**: 性能监控

## 2. 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 项目资源文件
│   ├── components/         # 通用组件
│   │   ├── Navbar.tsx      # 导航栏组件
│   │   ├── GameCard.tsx    # 游戏卡片组件
│   │   ├── Image.tsx       # 图片懒加载组件
│   │   ├── Hero.tsx        # 首页英雄区组件
│   │   ├── Cart.tsx        # 购物车组件
│   │   ├── ReviewForm.tsx  # 评论表单组件
│   │   └── ReviewList.tsx  # 评论列表组件
│   ├── pages/              # 页面组件
│   │   ├── HomePage.tsx    # 首页
│   │   ├── GamesPage.tsx   # 游戏列表页
│   │   ├── GameDetailPage.tsx # 游戏详情页
│   │   ├── CategoriesPage.tsx # 分类页
│   │   ├── CategoryGamesPage.tsx # 分类游戏列表页
│   │   ├── AuthPage.tsx    # 认证页
│   │   ├── CartPage.tsx    # 购物车页
│   │   ├── CheckoutPage.tsx # 结账页
│   │   └── StatsPage.tsx   # 统计页
│   ├── utils/              # 工具函数
│   │   ├── axios.ts        # Axios 实例配置
│   │   └── performance.ts  # 性能监控工具
│   ├── App.tsx             # 应用主组件
│   ├── main.tsx            # 应用入口
│   ├── index.css           # 全局样式
│   └── App.css             # 应用样式
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── tailwind.config.js      # Tailwind 配置
```

## 3. 架构设计

### 3.1 组件层次结构

```
App
├── Navbar
└── Routes
    ├── HomePage
    │   ├── Hero
    │   └── GameCard (列表)
    ├── GamesPage
    │   └── GameCard (列表)
    ├── GameDetailPage
    │   ├── Image
    │   ├── ReviewList
    │   └── ReviewForm
    ├── CategoriesPage
    ├── CategoryGamesPage
    │   └── GameCard (列表)
    ├── AuthPage
    ├── CartPage
    │   └── Cart
    ├── CheckoutPage
    └── StatsPage
```

### 3.2 数据流

1. **API 调用流程**:
   - 组件通过 `utils/axios.ts` 中的 `api` 实例发起请求
   - 请求经过拦截器处理（添加 token、检查缓存等）
   - 响应经过拦截器处理（缓存响应、处理错误等）
   - 组件接收响应数据并更新状态

2. **状态管理**:
   - 全局状态：使用 Zustand 管理用户信息、购物车等全局状态
   - 组件状态：使用 React useState 管理组件内部状态

3. **路由管理**:
   - 使用 React Router 7 进行路由管理
   - 实现了路由懒加载，减少初始包大小

## 4. 性能优化策略

### 4.1 代码分割
- **路由懒加载**: 使用 `React.lazy` 和 `Suspense` 实现路由组件的懒加载
- **组件懒加载**: 对于大型组件，使用 `React.lazy` 实现按需加载

### 4.2 资源优化
- **图片懒加载**: 实现了 `Image` 组件，使用 Intersection Observer 实现图片的延迟加载
- **图片优化**: 推荐使用适当尺寸的图片，考虑使用 WebP 格式

### 4.3 网络优化
- **请求缓存**: 实现了请求缓存机制，减少重复请求
- **错误处理**: 实现了请求错误处理和重试机制
- **请求合并**: 对于相同的请求，合并为一个请求

### 4.4 渲染优化
- **虚拟列表**: 对于长列表，考虑使用虚拟列表
- **memo**: 使用 `React.memo` 避免不必要的组件重渲染
- **useCallback/useMemo**: 优化函数和计算值的创建

## 5. 响应式设计

- **设计原则**: 移动优先设计
- **断点设置**: 使用 Tailwind CSS 的断点系统
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

- **布局策略**:
  - 移动端：单列布局，使用汉堡菜单
  - 平板：双列布局
  - 桌面：多列布局，完整导航栏

## 6. 无障碍设计

- **语义化 HTML**: 使用正确的 HTML 标签
- **ARIA 属性**: 为复杂组件添加适当的 ARIA 属性
- **键盘导航**: 确保所有功能可通过键盘访问
- **颜色对比度**: 确保文本和背景的对比度符合标准

## 7. 开发流程

### 7.1 代码规范
- **ESLint**: 代码风格检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

### 7.2 测试策略
- **单元测试**: 使用 Jest 测试工具函数和组件
- **集成测试**: 使用 Cypress 测试页面交互
- **端到端测试**: 使用 Cypress 测试完整流程

### 7.3 构建与部署
- **开发环境**: `npm run dev`
- **构建**: `npm run build`
- **预览**: `npm run preview`

## 8. 关键功能实现

### 8.1 路由懒加载
```typescript
// App.tsx
const HomePage = React.lazy(() => import('./pages/HomePage'));
const GamesPage = React.lazy(() => import('./pages/GamesPage'));
// ... 其他页面

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          {/* ... 其他路由 */}
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 8.2 图片懒加载
```typescript
// components/Image.tsx
const Image: React.FC<ImageProps> = ({ src, alt, className = '', placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentImgRef = imgRef.current;
    if (currentImgRef) {
      observer.observe(currentImgRef);
    }

    return () => {
      if (currentImgRef) {
        observer.unobserve(currentImgRef);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* 加载动画 */}
    </div>
  );
};
```

### 8.3 Axios 请求优化
```typescript
// utils/axios.ts
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 检查缓存（仅GET请求）
    if (config.method === 'get') {
      const cacheKey = generateCacheKey(config);
      const cachedData = requestCache.get(cacheKey);
      
      if (cachedData) {
        const now = Date.now();
        if (now - cachedData.timestamp < CACHE_EXPIRY) {
          // 使用缓存数据
          return Promise.reject({ cached: true, data: cachedData.data });
        } else {
          // 缓存已过期，删除缓存
          requestCache.delete(cacheKey);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 缓存响应（仅GET请求）
    if (response.config.method === 'get') {
      const cacheKey = generateCacheKey(response.config);
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => {
    // 处理缓存的响应
    if (error.cached) {
      return Promise.resolve({ data: error.data });
    }

    // 处理错误
    // ...

    return Promise.reject(error);
  }
);
```

### 8.4 性能监控
```typescript
// utils/performance.ts
import { onLCP, onCLS, onFCP, onTTFB } from 'web-vitals';

// 性能指标类型
interface PerformanceMetrics {
  name: string;
  delta: number;
  id: string;
}

// 性能监控回调
const sendToAnalytics = ({ name, delta, id }: PerformanceMetrics) => {
  console.log(`Performance Metric: ${name} | Value: ${delta} | ID: ${id}`);
  // 这里可以将数据发送到分析服务
};

/**
 * 初始化性能监控
 * 监控核心Web指标：LCP、CLS、FCP、TTFB等
 */
export const initPerformanceMonitoring = () => {
  onLCP(sendToAnalytics);
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};
```

## 9. 未来优化方向

- **PWA 支持**: 添加 Progressive Web App 支持
- **国际化**: 支持多语言
- **主题切换**: 支持深色/浅色主题
- **离线支持**: 添加离线访问能力
- **微前端**: 考虑使用微前端架构

## 10. 结论

本前端架构设计文档详细描述了游戏平台前端的技术架构、组件结构和数据流。通过采用现代的前端技术和优化策略，确保了应用的性能、可维护性和用户体验。同时，文档也为未来的扩展和优化提供了指导方向。
