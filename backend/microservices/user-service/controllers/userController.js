// 用户服务 - 用户控制器
import { Op } from 'sequelize';
import { User } from '../models/User.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const { user } = req;

    res.status(200).json({
      success: true,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        nickname: user.nickname,
        gender: user.gender,
        birthday: user.birthday,
        location: user.location,
        bio: user.bio,
        website: user.website,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新当前用户信息
 */
export const updateCurrentUser = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      nickname, avatarUrl, gender, birthday, location, bio, website,
    } = req.body;

    // 构建更新对象
    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = birthday;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;

    // 更新用户信息
    const updatedUser = await user.update(updateData);

    res.status(200).json({
      success: true,
      message: '更新用户信息成功',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        avatarUrl: updatedUser.avatarUrl,
        gender: updatedUser.gender,
        birthday: updatedUser.birthday,
        location: updatedUser.location,
        bio: updatedUser.bio,
        website: updatedUser.website,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户列表（管理员）
 */
export const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, search = '', role, status,
    } = req.query;

    // 构建查询条件
    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    // 分页查询
    const offset = (page - 1) * limit;
    const { count, rows: users } = await User.findAndCountAll({
      where,
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
      order: [['createdAt', 'desc']],
      attributes: [
        'id',
        'username',
        'email',
        'role',
        'status',
        'createdAt',
        'updatedAt',
        'lastLoginAt',
      ],
    });

    res.status(200).json({
      success: true,
      message: '获取用户列表成功',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page, 10),
          pageSize: parseInt(limit, 10),
          totalItems: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取指定用户信息（管理员）
 */
export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'username',
        'email',
        'role',
        'status',
        'avatarUrl',
        'nickname',
        'gender',
        'birthday',
        'location',
        'bio',
        'website',
        'createdAt',
        'updatedAt',
        'lastLoginAt',
        'failedLoginAttempts',
        'isVerified',
      ],
    });

    if (!user) {
      throw new NotFoundError('用户不存在', 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: '获取用户信息成功',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新指定用户信息（管理员）
 */
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      email, nickname, avatarUrl, gender, birthday, location, bio, website, status,
    } = req.body;

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户不存在', 'USER_NOT_FOUND');
    }

    // 构建更新对象
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = birthday;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (status !== undefined) updateData.status = status;

    // 更新用户信息
    const updatedUser = await user.update(updateData);

    res.status(200).json({
      success: true,
      message: '更新用户信息成功',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        nickname: updatedUser.nickname,
        avatarUrl: updatedUser.avatarUrl,
        gender: updatedUser.gender,
        birthday: updatedUser.birthday,
        location: updatedUser.location,
        bio: updatedUser.bio,
        website: updatedUser.website,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用户角色（管理员）
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // 验证角色
    if (!role || !['user', 'developer', 'admin'].includes(role)) {
      throw new BadRequestError('无效的角色', 'INVALID_ROLE');
    }

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户不存在', 'USER_NOT_FOUND');
    }

    // 不允许修改自己的角色为非管理员
    if (user.id === req.user.id && role !== 'admin') {
      throw new ForbiddenError('不允许修改自己的角色为非管理员', 'CANNOT_REVOKE_OWN_ADMIN');
    }

    // 更新角色
    const updatedUser = await user.update({ role });

    res.status(200).json({
      success: true,
      message: '更新用户角色成功',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除用户（管理员）
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户不存在', 'USER_NOT_FOUND');
    }

    // 不允许删除自己
    if (user.id === req.user.id) {
      throw new ForbiddenError('不允许删除自己', 'CANNOT_DELETE_SELF');
    }

    // 删除用户
    await user.destroy();

    res.status(200).json({
      success: true,
      message: '删除用户成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户统计信息
 */
export const getUserStatistics = async (req, res, next) => {
  try {
    const { user } = req;

    // 这里简化处理，实际应该从其他服务获取统计信息
    // 例如：从游戏库服务获取购买游戏数量和游玩时长
    // 从评价服务获取评价数量

    res.status(200).json({
      success: true,
      message: '获取用户统计信息成功',
      data: {
        totalGamesPurchased: 10,
        totalPlaytime: 3600,
        totalReviews: 5,
        joinDate: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
