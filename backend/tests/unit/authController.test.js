// 导入依赖和控制器
import { register, login } from '../../controllers/authController.js'
import User from '../../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// 模拟环境变量
process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '7d'

// 模拟依赖
jest.mock('../../models/User.js')
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

// 模拟请求和响应对象
const mockReq = (body = {}, user = null) => ({
  body,
  user
})

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('authController', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
      const res = mockRes()

      // 模拟依赖函数
      User.findOne.mockResolvedValue(null)
      bcrypt.genSalt.mockResolvedValue('salt')
      bcrypt.hash.mockResolvedValue('hashedPassword')
      User.create.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'user',
        created_at: new Date()
      })
      jwt.sign.mockReturnValue('test_token')

      // 执行测试
      await register(req, res)

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '用户注册成功',
        token: 'test_token'
      }))
    })

    it('should return error if username is already taken', async () => {
      // 模拟请求和响应
      const req = mockReq({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123'
      })
      const res = mockRes()

      // 模拟依赖函数
      User.findOne.mockResolvedValue({ username: 'existinguser' })

      // 执行测试
      await register(req, res)

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '该用户名已被注册'
      }))
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // 模拟请求和响应
      const req = mockReq({
        email: 'test@example.com',
        password: 'password123'
      })
      const res = mockRes()

      // 模拟依赖函数
      User.findOne.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'user',
        created_at: new Date()
      })
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue('test_token')

      // 执行测试
      await login(req, res)

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '登录成功',
        token: 'test_token'
      }))
    })

    it('should return error with invalid credentials', async () => {
      // 模拟请求和响应
      const req = mockReq({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      const res = mockRes()

      // 模拟依赖函数
      User.findOne.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'user',
        created_at: new Date()
      })
      bcrypt.compare.mockResolvedValue(false)

      // 执行测试
      await login(req, res)

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '邮箱或密码不正确'
      }))
    })
  })
})
