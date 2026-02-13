import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 实现路由懒加载
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const GamesPage = React.lazy(() => import('./pages/GamesPage'));
const GameDetailPage = React.lazy(() => import('./pages/GameDetailPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const CategoryGamesPage = React.lazy(() => import('./pages/CategoryGamesPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const StatsPage = React.lazy(() => import('./pages/StatsPage'));

// 加载状态组件
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-secondary-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:id" element={<GameDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryGamesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;