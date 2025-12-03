import express from 'express'
import {
  register,
  login,
  getCurrentUser,
  updateUserProfile,
  changePassword
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

// 创建路由器
const router = express.Router()

// 注册路由
router.post('/register', register)

// 登录路由
router.post('/login', login)

// 获取当前用户信息路由
router.get('/me', authenticate, getCurrentUser)

// 更新用户信息路由
router.put('/profile', authenticate, updateUserProfile)

// 修改密码路由
router.put('/password', authenticate, changePassword)

export default router