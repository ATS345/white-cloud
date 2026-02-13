import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Mock orders database
let orders: any[] = [];
let nextOrderId = 1;

// Mock downloads database
let downloads: any[] = [];
let nextDownloadId = 1;

// Mock games database
const games = [
  { id: 1, title: 'Cyberpunk 2077', price: 29.99 },
  { id: 2, title: 'The Witcher 3: Wild Hunt', price: 19.99 },
  { id: 3, title: 'Red Dead Redemption 2', price: 39.99 },
  { id: 4, title: 'Grand Theft Auto V', price: 29.99 },
  { id: 5, title: 'Elden Ring', price: 59.99 },
  { id: 6, title: 'God of War Ragnarök', price: 59.99 }
];

// Create order
router.post('/', authMiddleware, (req, res) => {
  const { items } = req.body;
  const userId = req.user?.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  // Calculate total amount
  let totalAmount = 0;
  const orderItems = items.map((item: any) => {
    const game = games.find(g => g.id === item.game_id);
    if (!game) {
      return res.status(404).json({ error: `Game with ID ${item.game_id} not found` });
    }
    const itemTotal = game.price * (item.quantity || 1);
    totalAmount += itemTotal;
    return {
      game_id: game.id,
      title: game.title,
      price: game.price,
      quantity: item.quantity || 1,
      total: itemTotal
    };
  });

  // Create new order
  const newOrder = {
    id: nextOrderId++,
    user_id: userId,
    total_amount: totalAmount,
    payment_status: 'pending',
    payment_method: null,
    transaction_id: null,
    items: orderItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// Get user orders
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user?.id;
  const userOrders = orders.filter(order => order.user_id === userId);
  res.status(200).json(userOrders);
});

// Get order by ID
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const order = orders.find(order => order.id === parseInt(id) && order.user_id === userId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.status(200).json(order);
});

// Pay for order
router.put('/:id/pay', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { payment_method, transaction_id } = req.body;
  const userId = req.user?.id;
  const orderIndex = orders.findIndex(order => order.id === parseInt(id) && order.user_id === userId);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (orders[orderIndex].payment_status === 'completed') {
    return res.status(400).json({ error: 'Order is already paid' });
  }

  // Update order
  orders[orderIndex] = {
    ...orders[orderIndex],
    payment_status: 'completed',
    payment_method,
    transaction_id,
    updated_at: new Date().toISOString()
  };

  res.status(200).json(orders[orderIndex]);
});

// Get user downloads
router.get('/downloads', authMiddleware, (req, res) => {
  const userId = req.user?.id;
  const userDownloads = downloads.filter(download => download.user_id === userId);
  res.status(200).json(userDownloads);
});

// Download game (create download record)
router.post('/downloads/:gameId', authMiddleware, (req, res) => {
  const { gameId } = req.params;
  const userId = req.user?.id;
  const game = games.find(g => g.id === parseInt(gameId));

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Check if user has purchased the game (simplified check - in real app, check orders)
  const hasPurchased = orders.some(order => 
    order.user_id === userId && 
    order.payment_status === 'completed' &&
    order.items.some((item: any) => item.game_id === parseInt(gameId))
  );

  if (!hasPurchased) {
    return res.status(403).json({ error: 'You must purchase this game before downloading' });
  }

  // Create download record
  const newDownload = {
    id: nextDownloadId++,
    user_id: userId,
    game_id: parseInt(gameId),
    game_title: game.title,
    download_date: new Date().toISOString(),
    ip_address: req.ip || 'unknown'
  };

  downloads.push(newDownload);

  // Generate download URL (simplified - in real app, generate signed URL)
  const downloadUrl = `http://localhost:3001/api/games/${gameId}/download`;

  res.status(201).json({
    download_id: newDownload.id,
    game_id: newDownload.game_id,
    game_title: newDownload.game_title,
    download_url: downloadUrl,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours expiry
  });
});

export default router;