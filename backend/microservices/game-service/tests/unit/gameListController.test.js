// 游戏服务 - 游戏列表控制器单元测试
import {
  getGameList,
  getGameDetail,
  getCategories,
  getTags,
  getPopularGames,
  getNewGames,
} from '../../controllers/gameListController.js';

// 导入模拟的模型
import Game from '../../models/Game.js';
import GameCategory from '../../models/GameCategory.js';
import GameTag from '../../models/GameTag.js';

// 模拟依赖
jest.mock('../../config/redis.js', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  disconnect: jest.fn().mockResolvedValue(),
}));

// 修复ES模块默认导出的模拟
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
  findAndCountAll: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  sequelize: {
    Op: {
      or: Symbol('or'),
      like: Symbol('like'),
    },
  },
}));

jest.mock('../../models/GameCategory.js', () => ({
  findAll: jest.fn(),
}));

jest.mock('../../models/GameTag.js', () => ({
  findAll: jest.fn(),
}));

// 模拟请求和响应对象
const mockReq = (params = {}, query = {}) => ({
  params,
  query,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('GameListController', () => {
  describe('getGameList', () => {
    it('should get games successfully without cache', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        page: '1',
        limit: '10',
      });
      const res = mockRes();

      // 模拟游戏查询结果
      const mockGames = {
        count: 2,
        rows: [
          {
            id: 1,
            title: 'Game 1',
            description: 'Description 1',
            price: 9.99,
            release_date: new Date(),
            rating: 4.5,
            review_count: 100,
            status: 'approved',
            main_image_url: 'url1.jpg',
            categories: [{ id: 1, name: 'Action' }],
            tags: [{ id: 1, name: 'RPG' }],
          },
          {
            id: 2,
            title: 'Game 2',
            description: 'Description 2',
            price: 19.99,
            release_date: new Date(),
            rating: 4.8,
            review_count: 200,
            status: 'approved',
            main_image_url: 'url2.jpg',
            categories: [{ id: 2, name: 'Adventure' }],
            tags: [{ id: 2, name: 'Open World' }],
          },
        ],
      };

      // 设置模拟函数
      Game.findAndCountAll.mockResolvedValue(mockGames);

      // 执行测试
      await getGameList(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '获取游戏列表成功',
          data: expect.objectContaining({
            games: mockGames.rows,
            pagination: expect.objectContaining({
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
            }),
          }),
        }),
      );
    });

    it('should handle error when getting games', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        page: '1',
        limit: '10',
      });
      const res = mockRes();

      // 设置模拟函数抛出错误
      Game.findAndCountAll.mockRejectedValue(new Error('Database error'));

      // 执行测试
      await getGameList(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: '获取游戏列表失败',
          }),
        }),
      );
    });
  });

  describe('getGameDetail', () => {
    it('should get game by id successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '1' });
      const res = mockRes();

      // 模拟游戏查询结果
      const mockGame = {
        id: 1,
        title: 'Game 1',
        description: 'Description 1',
        price: 9.99,
        release_date: new Date(),
        rating: 4.5,
        review_count: 100,
        status: 'approved',
        main_image_url: 'url1.jpg',
        categories: [{ id: 1, name: 'Action' }],
        tags: [{ id: 1, name: 'RPG' }],
      };

      // 设置模拟函数
      Game.findByPk.mockResolvedValue(mockGame);

      // 执行测试
      await getGameDetail(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '获取游戏详情成功',
          data: mockGame,
        }),
      );
    });

    it('should return 404 when game not found', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '999' });
      const res = mockRes();

      // 设置模拟函数返回null
      Game.findByPk.mockResolvedValue(null);

      // 执行测试
      await getGameDetail(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: '游戏不存在',
          }),
        }),
      );
    });
  });

  describe('getCategories', () => {
    it('should get categories successfully', async () => {
      // 模拟请求和响应
      const req = mockReq();
      const res = mockRes();

      // 模拟分类查询结果
      const mockCategories = [
        { id: 1, name: 'Action', description: 'Action games' },
        { id: 2, name: 'Adventure', description: 'Adventure games' },
      ];

      // 设置模拟函数
      GameCategory.findAll.mockResolvedValue(mockCategories);

      // 执行测试
      await getCategories(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '获取游戏分类列表成功',
          data: mockCategories,
        }),
      );
    });
  });

  describe('getTags', () => {
    it('should get tags successfully', async () => {
      // 模拟请求和响应
      const req = mockReq();
      const res = mockRes();

      // 模拟标签查询结果
      const mockTags = [
        { id: 1, name: 'RPG' },
        { id: 2, name: 'Open World' },
      ];

      // 设置模拟函数
      GameTag.findAll.mockResolvedValue(mockTags);

      // 执行测试
      await getTags(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '获取游戏标签列表成功',
          data: mockTags,
        }),
      );
    });
  });

  describe('getPopularGames', () => {
    it('should get popular games successfully', async () => {
      // 模拟请求和响应
      const req = mockReq();
      const res = mockRes();

      // 模拟热门游戏查询结果
      const mockGames = [
        {
          id: 1, title: 'Game 1', rating: 4.8, review_count: 200,
        },
        {
          id: 2, title: 'Game 2', rating: 4.7, review_count: 150,
        },
      ];

      // 设置模拟函数
      Game.findAll.mockResolvedValue(mockGames);

      // 执行测试
      await getPopularGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '获取热门游戏列表成功',
          data: mockGames,
        }),
      );
    });
  });

  describe('getNewGames', () => {
    it('should get new games successfully', async () => {
      // 模拟请求和响应
      const req = mockReq();
      const res = mockRes();

      // 模拟新游戏查询结果
      const mockGames = [
        { id: 1, title: 'Game 1', release_date: new Date('2025-12-01') },
        { id: 2, title: 'Game 2', release_date: new Date('2025-11-15') },
      ];

      // 设置模拟函数
      Game.findAll.mockResolvedValue(mockGames);

      // 执行测试
      await getNewGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '获取新游戏列表成功',
          data: mockGames,
        }),
      );
    });
  });
});
