// 游戏服务 - 游戏管理控制器单元测试
import {
  createGame,
  updateGame,
  deleteGame,
  batchDeleteGames,
  updateGameStatus,
  getDeveloperGames,
} from '../../controllers/gameManagementController.js';

// 导入模拟的模型
import Game from '../../models/Game.js';
import Developer from '../../models/Developer.js';

// 模拟依赖
jest.mock('../../config/redis.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    disconnect: jest.fn().mockResolvedValue(),
  },
}));

jest.mock('../../config/logger.js', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// 直接在 mock 中定义模型，避免 hoisting 问题
jest.mock('../../models/Game.js', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  sequelize: {
    Op: {
      in: Symbol('in'),
    },
  },
}));

// 创建一个模拟函数来代替 update 方法，避免循环引用
const mockUpdateMethod = jest.fn();

jest.mock('../../models/Developer.js', () => ({
  findByPk: jest.fn(),
}));

// 模拟请求和响应对象
const mockReq = (params = {}, body = {}, user = {}) => ({
  params,
  body,
  user,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('GameManagementController', () => {
  // 设置默认的用户对象
  const defaultUser = {
    id: 1,
    email: 'test@example.com',
    role: 'developer',
    developerId: 1,
  };

  describe('createGame', () => {
    it('should create a game successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        title: 'Test Game',
        description: 'Test Description',
        price: 9.99,
        release_date: new Date().toISOString(),
        status: 'pending',
        main_image_url: 'test.jpg',
        categories: [1, 2],
        tags: [1, 2],
      }, defaultUser);
      const res = mockRes();

      // 模拟游戏创建结果
      const mockGame = {
        id: 1,
        title: 'Test Game',
        developer_id: defaultUser.developerId,
        ...req.body,
      };

      // 设置模拟函数
      Game.create.mockResolvedValue(mockGame);
      Developer.findByPk.mockResolvedValue({ id: defaultUser.developerId });

      // 执行测试
      await createGame(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '游戏创建成功',
          data: mockGame,
        }),
      );
    });

    it('should handle error when creating game', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        title: 'Test Game',
        description: 'Test Description',
        price: 9.99,
        release_date: new Date().toISOString(),
        status: 'pending',
        main_image_url: 'test.jpg',
      }, defaultUser);
      const res = mockRes();

      // 设置模拟函数抛出错误
      Game.create.mockRejectedValue(new Error('Database error'));
      Developer.findByPk.mockResolvedValue({ id: defaultUser.developerId });

      // 执行测试
      await createGame(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: '创建游戏失败',
          }),
        }),
      );
    });
  });

  describe('updateGame', () => {
    it('should update a game successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '1' }, {
        title: 'Updated Game',
        description: 'Updated Description',
      }, defaultUser);
      const res = mockRes();

      // 模拟游戏查询和更新结果
      const mockGame = {
        id: 1,
        title: 'Test Game',
        developer_id: defaultUser.developerId,
        description: 'Test Description',
        price: 9.99,
      };

      // 设置模拟函数
      Game.findByPk.mockResolvedValue({
        ...mockGame,
        update: jest.fn().mockResolvedValue(mockGame),
      });

      // 执行测试
      await updateGame(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '游戏更新成功',
          data: expect.objectContaining(mockGame),
        }),
      );
    });

    it('should return 404 when updating non-existent game', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '999' }, {
        title: 'Updated Game',
      }, defaultUser);
      const res = mockRes();

      // 设置模拟函数返回null
      Game.findByPk.mockResolvedValue(null);

      // 执行测试
      await updateGame(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'GAME_NOT_FOUND',
            message: '游戏不存在',
          }),
        }),
      );
    });
  });

  describe('deleteGame', () => {
    it('should delete a game successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '1' }, {}, defaultUser);
      const res = mockRes();

      // 模拟游戏查询结果
      const mockGame = {
        id: 1,
        title: 'Test Game',
        developer_id: defaultUser.developerId,
        destroy: jest.fn().mockResolvedValue(1),
      };

      // 设置模拟函数
      Game.findByPk.mockResolvedValue(mockGame);

      // 执行测试
      await deleteGame(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '游戏删除成功',
        }),
      );
    });

    it('should return 404 when deleting non-existent game', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '999' }, {}, defaultUser);
      const res = mockRes();

      // 设置模拟函数返回null
      Game.findByPk.mockResolvedValue(null);

      // 执行测试
      await deleteGame(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'GAME_NOT_FOUND',
            message: '游戏不存在',
          }),
        }),
      );
    });
  });

  describe('batchDeleteGames', () => {
    it('should batch delete games successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        ids: ['1', '2', '3'],
      }, { id: 1, role: 'admin' });
      const res = mockRes();

      // 设置模拟函数
      Game.destroy.mockResolvedValue(3);

      // 执行测试
      await batchDeleteGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '游戏批量删除成功',
          data: { deletedCount: 3 },
        }),
      );
    });

    it('should handle error when batch deleting games', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        ids: ['1', '2', '3'],
      }, { id: 1, role: 'admin' });
      const res = mockRes();

      // 设置模拟函数抛出错误
      Game.destroy.mockRejectedValue(new Error('Database error'));

      // 执行测试
      await batchDeleteGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: '批量删除游戏失败',
          }),
        }),
      );
    });
  });

  describe('updateGameStatus', () => {
    it('should update game status successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '1' }, {
        status: 'approved',
      }, { id: 1, role: 'admin' });
      const res = mockRes();

      // 模拟游戏查询和更新结果
      const mockGame = {
        id: 1,
        title: 'Test Game',
        status: 'pending',
      };

      // 设置模拟函数
      Game.findByPk.mockResolvedValue({
        ...mockGame,
        update: jest.fn().mockResolvedValue(mockGame),
      });

      // 执行测试
      await updateGameStatus(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '游戏状态更新成功',
          data: expect.objectContaining(mockGame),
        }),
      );
    });
  });

  describe('getDeveloperGames', () => {
    it('should get developer games successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({ developerId: '1' }, {}, defaultUser);
      req.query = { page: '1', limit: '10' };
      const res = mockRes();

      // 模拟游戏查询结果
      const mockGames = [
        { id: 1, title: 'Game 1', developer_id: 1, categories: [], tags: [] },
        { id: 2, title: 'Game 2', developer_id: 1, categories: [], tags: [] },
      ];

      // 设置模拟函数
      Game.findAndCountAll.mockResolvedValue({
        count: mockGames.length,
        rows: mockGames
      });
      Developer.findByPk.mockResolvedValue({ id: 1 });

      // 执行测试
      await getDeveloperGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '获取开发者游戏列表成功',
          data: expect.objectContaining({
            games: mockGames,
            pagination: expect.objectContaining({
              total: mockGames.length,
              totalPages: 1
            })
          }),
        }),
      );
    });
  });
});
