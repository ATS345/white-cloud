import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// 使用React.lazy()实现按需加载
const App = lazy(() => import('../App'));
const Home = lazy(() => import('../pages/Home'));
const GameDetail = lazy(() => import('../pages/GameDetail'));
const GameLibrary = lazy(() => import('../pages/GameLibrary'));
const UserCenter = lazy(() => import('../pages/UserCenter'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));

// 创建Suspense组件，作为懒加载的fallback
const withSuspense = (Component: React.ComponentType) => {
  return () => (
    <Suspense fallback={<div className="loading">加载中...</div>}>
      <Component />
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: withSuspense(Home)(),
      },
      {
        path: 'game/:id',
        element: withSuspense(GameDetail)(),
      },
      {
        path: 'library',
        element: withSuspense(GameLibrary)(),
      },
      {
        path: 'user',
        element: withSuspense(UserCenter)(),
      },
    ],
  },
  {
    path: '/login',
    element: withSuspense(Login)(),
  },
  {
    path: '/register',
    element: withSuspense(Register)(),
  },
]);

export default router;
