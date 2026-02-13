import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Mock data for stats
const mockStats = {
  games: {
    total_games: 100,
    total_downloads: 5000,
    total_reviews: 2000
  },
  users: {
    total_users: 1000,
    new_users_today: 10,
    active_users_this_week: 500
  },
  sales: {
    total_sales: 50000,
    sales_today: 500,
    top_selling_games: [
      { id: 1, title: 'Cyberpunk 2077', sales: 1000 },
      { id: 2, title: 'The Witcher 3', sales: 800 },
      { id: 3, title: 'Red Dead Redemption 2', sales: 700 },
      { id: 4, title: 'Grand Theft Auto V', sales: 600 },
      { id: 5, title: 'Elden Ring', sales: 500 }
    ]
  }
};

// Get games stats
router.get('/stats/games', (req, res) => {
  res.status(200).json(mockStats.games);
});

// Get users stats
router.get('/stats/users', (req, res) => {
  res.status(200).json(mockStats.users);
});

// Get sales stats
router.get('/stats/sales', (req, res) => {
  res.status(200).json(mockStats.sales);
});

// Get all stats (admin only)
router.get('/stats', authMiddleware, (req, res) => {
  // In a real app, check if user is admin
  res.status(200).json(mockStats);
});

export default router;