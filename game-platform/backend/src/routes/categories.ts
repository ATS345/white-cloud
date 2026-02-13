import express from 'express';

const router = express.Router();

// Mock categories
const categories = [
  { id: 1, name: 'Action', slug: 'action' },
  { id: 2, name: 'Role-playing', slug: 'role-playing' },
  { id: 3, name: 'Open World', slug: 'open-world' },
  { id: 4, name: 'Adventure', slug: 'adventure' },
  { id: 5, name: 'Strategy', slug: 'strategy' },
  { id: 6, name: 'Simulation', slug: 'simulation' },
  { id: 7, name: 'Sports', slug: 'sports' },
  { id: 8, name: 'Racing', slug: 'racing' }
];

// Get all categories
router.get('/', (req, res) => {
  res.status(200).json(categories);
});

// Get category by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const category = categories.find(cat => cat.id === parseInt(id));
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.status(200).json(category);
});

export default router;