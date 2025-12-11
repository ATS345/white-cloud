// 用户服务 - 用户路由
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getCurrentUser, updateCurrentUser, getUser, getUsers, updateUser, deleteUser, updateUserRole, getUserStatistics } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: 获取当前用户信息
 *     description: 获取当前登录用户的详细信息
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取用户信息成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: testuser
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: test@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                     avatarUrl:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     nickname:
 *                       type: string
 *                       example: Test User
 *                     gender:
 *                       type: string
 *                       example: male
 *                     birthday:
 *                       type: string
 *                       format: date
 *                       example: 1990-01-01
 *                     location:
 *                       type: string
 *                       example: 北京
 *                     bio:
 *                       type: string
 *                       example: 这是一个测试用户
 *                     website:
 *                       type: string
 *                       example: https://example.com
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-01T00:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-01T00:00:00.000Z
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: 更新当前用户信息
 *     description: 更新当前登录用户的信息
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *                 example: Test User
 *               avatarUrl:
 *                 type: string
 *                 description: 头像URL
 *                 example: https://example.com/avatar.jpg
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: 性别
 *                 example: male
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *                 example: 1990-01-01
 *               location:
 *                 type: string
 *                 description: 所在地
 *                 example: 北京
 *               bio:
 *                 type: string
 *                 description: 个人简介
 *                 example: 这是一个测试用户
 *               website:
 *                 type: string
 *                 description: 个人网站
 *                 example: https://example.com
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 更新用户信息成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: testuser
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: test@example.com
 *                     nickname:
 *                       type: string
 *                       example: Test User
 *                     avatarUrl:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     gender:
 *                       type: string
 *                       example: male
 *                     birthday:
 *                       type: string
 *                       format: date
 *                       example: 1990-01-01
 *                     location:
 *                       type: string
 *                       example: 北京
 *                     bio:
 *                       type: string
 *                       example: 这是一个测试用户
 *                     website:
 *                       type: string
 *                       example: https://example.com
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/me', authenticate, updateCurrentUser);

/**
 * @swagger
 * /api/v1/users/me/statistics:
 *   get:
 *     summary: 获取当前用户统计信息
 *     description: 获取当前登录用户的统计信息，如购买游戏数量、游玩时长等
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取用户统计信息成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalGamesPurchased:
 *                       type: integer
 *                       example: 10
 *                     totalPlaytime:
 *                       type: integer
 *                       example: 3600
 *                     totalReviews:
 *                       type: integer
 *                       example: 5
 *                     joinDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-01T00:00:00.000Z
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me/statistics', authenticate, getUserStatistics);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: 获取用户列表
 *     description: 获取用户列表，仅管理员可访问
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, developer, admin]
 *         description: 用户角色
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, banned]
 *         description: 用户状态
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取用户列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: testuser
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: test@example.com
 *                           role:
 *                             type: string
 *                             example: user
 *                           status:
 *                             type: string
 *                             example: active
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-01-01T00:00:00.000Z
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticate, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: 获取指定用户信息
 *     description: 获取指定用户的详细信息，仅管理员可访问
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取用户信息成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: testuser
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: test@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                     status:
 *                       type: string
 *                       example: active
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-01-01T00:00:00.000Z
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:userId', authenticate, authorize('admin'), getUser);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   put:
 *     summary: 更新指定用户信息
 *     description: 更新指定用户的信息，仅管理员可访问
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱
 *                 example: test@example.com
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *                 example: Test User
 *               avatarUrl:
 *                 type: string
 *                 description: 头像URL
 *                 example: https://example.com/avatar.jpg
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: 性别
 *                 example: male
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *                 example: 1990-01-01
 *               location:
 *                 type: string
 *                 description: 所在地
 *                 example: 北京
 *               bio:
 *                 type: string
 *                 description: 个人简介
 *                 example: 这是一个测试用户
 *               website:
 *                 type: string
 *                 description: 个人网站
 *                 example: https://example.com
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended, banned]
 *                 description: 用户状态
 *                 example: active
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 更新用户信息成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: testuser
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: test@example.com
 *                     status:
 *                       type: string
 *                       example: active
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:userId', authenticate, authorize('admin'), updateUser);

/**
 * @swagger
 * /api/v1/users/{userId}/role:
 *   patch:
 *     summary: 更新用户角色
 *     description: 更新指定用户的角色，仅管理员可访问
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, developer, admin]
 *                 description: 用户角色
 *                 example: developer
 *             required:
 *               - role
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 更新用户角色成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: testuser
 *                     role:
 *                       type: string
 *                       example: developer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:userId/role', authenticate, authorize('admin'), updateUserRole);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   delete:
 *     summary: 删除用户
 *     description: 删除指定用户，仅管理员可访问
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 删除用户成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:userId', authenticate, authorize('admin'), deleteUser);

export default router;