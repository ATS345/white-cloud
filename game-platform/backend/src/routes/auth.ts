import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Mock user database
let users: any[] = [];
let nextUserId = 1;

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = {
    id: nextUserId++,
    username,
    email,
    passwordHash,
    avatar: '',
    bio: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);

  // Generate JWT token
  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, email: newUser.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    token
  });
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    token
  });
});

// Get current user route
router.get('/me', authMiddleware, (req, res) => {
  const user = users.find(user => user.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt
  });
});

// Update user route
router.put('/update', authMiddleware, (req, res) => {
  const { username, bio, avatar } = req.body;
  const userId = req.user?.id;

  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if username is already taken
  if (username && users.some(user => user.username === username && user.id !== userId)) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    bio: bio || users[userIndex].bio,
    avatar: avatar || users[userIndex].avatar,
    updatedAt: new Date().toISOString()
  };

  res.status(200).json({
    id: users[userIndex].id,
    username: users[userIndex].username,
    email: users[userIndex].email,
    bio: users[userIndex].bio,
    avatar: users[userIndex].avatar
  });
});

// Change password route
router.put('/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check old password
  const isPasswordValid = await bcrypt.compare(oldPassword, users[userIndex].passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid old password' });
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  users[userIndex] = {
    ...users[userIndex],
    passwordHash: newPasswordHash,
    updatedAt: new Date().toISOString()
  };

  res.status(200).json({ message: 'Password changed successfully' });
});

export default router;