import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import GamesPage from './pages/GamesPage';
import GameDetailPage from './pages/GameDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryGamesPage from './pages/CategoryGamesPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:slug" element={<CategoryGamesPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </Router>
  );
}

export default App;