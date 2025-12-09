// 导入依赖和控制器
import { getGames, getGameById } from '../../controllers/game/gameListController.js';
import { cacheQuery } from '../../utils/cacheUtils.js';
import models from '../../models/index.js';

// 先模拟Redis连接，避免测试环境中Redis连接失败
jest.mock('../../config/redis.js', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    disconnect: jest.fn().mockResolvedValue(),
  },
  initRedis: jest.fn(),
}));

// 先模拟models/index.js，避免实际执行模型关联
jest.mock('../../models/index.js', () => {
  const mockGame = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  };
  return {
    Game: mockGame,
    GameCategory: jest.fn(),
    GameTag: jest.fn(),
    GameSystemRequirement: jest.fn(),
    Developer: jest.fn(),
    syncModels: jest.fn(),
  };
});

// 模拟其他依赖
jest.mock('../../models/Game.js');
jest.mock('../../models/GameCategory.js');
jest.mock('../../models/GameTag.js');
jest.mock('../../utils/cacheUtils.js', () => ({
  cacheQuery: jest.fn().mockImplementation(async (cacheKey, expiry, queryFn) => queryFn()),
  generateGameListCacheKey: jest.fn().mockReturnValue('test-game-list-cache-key'),
  generateGameDetailCacheKey: jest.fn().mockReturnValue('test-game-detail-cache-key'),
  CACHE_EXPIRY: {
    SHORT: 3600,
    MEDIUM: 86400,
    LONG: 604800,
  },
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

describe('gameListController', () => {
  describe('getGames', () => {
    it('should get games successfully without cache', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        page: '1',
        limit: '20',
        status: 'approved',
      });
      const res = mockRes();

      // 模拟缓存未命中，直接执行查询
      cacheQuery.mockImplementation(async (cacheKey, expiry, queryFn) => queryFn());

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

      // 使用models.Game来设置模拟函数
      models.Game.findAndCountAll.mockResolvedValue(mockGames);

      // 执行测试
      await getGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '游戏列表获取成功',
          data: expect.objectContaining({
            games: mockGames.rows,
            pagination: expect.objectContaining({
              currentPage: 1,
              pageSize: 20,
              totalItems: 2,
              totalPages: 1,
            }),
          }),
        })
      );
    });

    it('should handle error when getting games', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        page: '1',
        limit: '20',
      });
      const res = mockRes();

      // 模拟缓存未命中，直接执行查询并抛出错误
      cacheQuery.mockImplementation(async (cacheKey, expiry, queryFn) => queryFn());
      models.Game.findAndCountAll.mockRejectedValue(new Error('Database error'));

      // 执行测试
      await getGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '获取游戏列表失败',
          error: 'Database error',
        })
      );
    });
  });

  describe('getGameById', () => {
    it('should get game by id successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '1' });
      const res = mockRes();

      // 模拟缓存未命中，直接执行查询
      cacheQuery.mockImplementation(async (cacheKey, expiry, queryFn) => queryFn());

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
        system_requirements: [
          {
            id: 1,
            type: 'minimum',
            os: 'Windows 10',
            processor: 'Intel i5',
            memory: '8GB',
            graphics: 'GTX 1050',
            storage: '50GB',
          },
        ],
        developer: {
          id: 1,
          name: 'Developer 1',
          description: 'Description',
        },
      };

      // 使用models.Game来设置模拟函数
      models.Game.findByPk.mockResolvedValue(mockGame);

      // 执行测试
      await getGameById(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: '游戏详情获取成功',
          data: mockGame,
        })
      );
    });

    it('should return 404 when game not found', async () => {
      // 模拟请求和响应
      const req = mockReq({ id: '999' });
      const res = mockRes();

      // 模拟缓存未命中，直接执行查询
      cacheQuery.mockImplementation(async (cacheKey, expiry, queryFn) => queryFn());
      models.Game.findByPk.mockResolvedValue(null);

      // 执行测试
      await getGameById(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: '游戏不存在',
        })
      );
    });
  });
});
