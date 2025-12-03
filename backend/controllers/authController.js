import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// 注册新用户
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role = 'user'
    } = req.body

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码是必填项'
      })
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({
      where: { username }
    })

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: '该用户名已被注册'
      })
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email }
    })

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      })
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(12)
    const password_hash = await bcrypt.hash(password, salt)

    // 创建用户
    const user = await User.create({
      username,
      email,
      password_hash,
      role
    })

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    // 返回响应
    res.status(201).json({
      success: true,
      message: '用户注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({
      success: false,
      message: '注册过程中发生错误',
      error: error.message
    })
  }
}

// 用户登录
export const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码是必填项'
      })
    }

    // 查找用户
    const user = await User.findOne({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      })
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    // 返回响应
    res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({
      success: false,
      message: '登录过程中发生错误',
      error: error.message
    })
  }
}

// 获取当前用户信息
export const getCurrentUser = async (req, res) => {
  try {
    // 从请求对象获取用户信息
    const user = req.user

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息过程中发生错误',
      error: error.message
    })
  }
}

// 更新用户信息
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.user
    const {
      username,
      email,
      avatar_url
    } = req.body

    // 查找用户
    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 更新用户名（如果提供且不同）
    if (username && username !== user.username) {
      // 检查用户名是否已存在
      const existingUsername = await User.findOne({
        where: { username }
      })

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: '该用户名已被注册'
        })
      }

      user.username = username
    }

    // 更新邮箱（如果提供且不同）
    if (email && email !== user.email) {
      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({
        where: { email }
      })

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        })
      }

      user.email = email
    }

    // 更新头像URL（如果提供）
    if (avatar_url) {
      user.avatar_url = avatar_url
    }

    // 保存更新
    await user.save()

    // 返回响应
    res.status(200).json({
      success: true,
      message: '用户信息更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({
      success: false,
      message: '更新用户信息过程中发生错误',
      error: error.message
    })
  }
}

// 修改密码
export const changePassword = async (req, res) => {
  try {
    const { id } = req.user
    const {
      currentPassword,
      newPassword
    } = req.body

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '当前密码和新密码是必填项'
      })
    }

    // 查找用户
    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码不正确'
      })
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(12)
    const password_hash = await bcrypt.hash(newPassword, salt)

    // 更新密码
    user.password_hash = password_hash
    await user.save()

    // 返回响应
    res.status(200).json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码错误:', error)
    res.status(500).json({
      success: false,
      message: '修改密码过程中发生错误',
      error: error.message
    })
  }
}