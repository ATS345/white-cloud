// 导入依赖和控制器
import { Op } from 'sequelize';
import {
  registerDeveloper,
  getDeveloperInfo,
  updateDeveloperInfo,
  getDeveloperGames,
  getGameSalesStats,
  getDeveloperEarnings,
  createWithdrawalRequest,
  getWithdrawalRequests,
  getGameAnalytics,
  getGameComparison,
  getUserBehaviorAnalytics,
} from '../../controllers/developerController.js';
import Developer from '../../models/Developer.js';
import Game from '../../models/Game.js';
import OrderItem from '../../models/OrderItem.js';
import DeveloperFinance from '../../models/DeveloperFinance.js';
import WithdrawalRequest from '../../models/WithdrawalRequest.js';

// 模拟环境变量
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '7d';

// 模拟依赖
jest.mock('../../models/Developer.js');
jest.mock('../../models/Game.js');
jest.mock('../../models/GameCategory.js');
jest.mock('../../models/GameTag.js');
jest.mock('../../models/Order.js');
jest.mock('../../models/OrderItem.js');
jest.mock('../../models/DeveloperFinance.js');
jest.mock('../../models/WithdrawalRequest.js');

// 模拟sequelize.fn和sequelize.col
global.sequelize = {
  fn: jest.fn().mockImplementation((name, value) => `${name}(${value})`),
  col: jest.fn().mockImplementation((value) => value),
  Op,
};

// 模拟请求和响应对象
const mockReq = (body = {}, query = {}, user = null) => ({
  body,
  query,
  user: {
    id: 1,
    role: 'user',
    ...user,
  },
  params: {},
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('developerController', () => {
  describe('registerDeveloper', () => {
    it('should register a new developer successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({
        companyName: 'Test Company',
        contactEmail: 'contact@test.com',
        website: 'https://test.com',
        bio: 'Test bio',
      });
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue(null);
      Developer.create.mockResolvedValue({
        id: 1,
        user_id: req.user.id,
        company_name: 'Test Company',
        contact_email: 'contact@test.com',
        website: 'https://test.com',
        bio: 'Test bio',
        created_at: new Date(),
      });

      // 执行测试
      await registerDeveloper(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '开发者账户注册成功',
        data: expect.any(Object),
      }));
    });

    it('should return error if company_name or contact_email is missing', async () => {
      // 模拟请求和响应
      const req = mockReq({
        website: 'https://test.com',
        bio: 'Test bio',
      });
      const res = mockRes();

      // 执行测试
      await registerDeveloper(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '公司名称和联系邮箱是必填项',
      }));
    });

    it('should return error if developer account already exists', async () => {
      // 模拟请求和响应
      const req = mockReq({
        companyName: 'Test Company',
        contactEmail: 'contact@test.com',
      });
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue({
        id: 1,
        user_id: req.user.id,
        company_name: 'Existing Company',
      });

      // 执行测试
      await registerDeveloper(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '您已经注册了开发者账户',
      }));
    });
  });

  describe('getDeveloperInfo', () => {
    it('should get developer info successfully', async () => {
      // 模拟请求和响应
      const req = mockReq();
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue({
        id: 1,
        user_id: req.user.id,
        company_name: 'Test Company',
        contact_email: 'contact@test.com',
        website: 'https://test.com',
        bio: 'Test bio',
      });

      // 执行测试
      await getDeveloperInfo(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取开发者信息成功',
        data: expect.any(Object),
      }));
    });

    it('should return error if developer account does not exist', async () => {
      // 模拟请求和响应
      const req = mockReq();
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue(null);

      // 执行测试
      await getDeveloperInfo(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '开发者账户不存在',
      }));
    });
  });

  describe('updateDeveloperInfo', () => {
    it('should update developer info successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({
        companyName: 'Updated Company',
        contactEmail: 'updated@test.com',
        website: 'https://updated.com',
        bio: 'Updated bio',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
        company_name: 'Test Company',
        contact_email: 'contact@test.com',
        website: 'https://test.com',
        bio: 'Test bio',
        update: jest.fn().mockResolvedValue(null),
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      // 执行测试
      await updateDeveloperInfo(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '开发者信息更新成功',
        data: mockDeveloper,
      }));
      expect(mockDeveloper.update).toHaveBeenCalledWith({
        company_name: 'Updated Company',
        contact_email: 'updated@test.com',
        website: 'https://updated.com',
        bio: 'Updated bio',
      });
    });

    it('should return error if developer account does not exist', async () => {
      // 模拟请求和响应
      const req = mockReq({
        company_name: 'Updated Company',
      });
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue(null);

      // 执行测试
      await updateDeveloperInfo(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '开发者账户不存在',
      }));
    });
  });

  describe('getDeveloperGames', () => {
    it('should get developer games successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        page: 1,
        limit: 10,
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
        company_name: 'Test Company',
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockGames = {
        count: 2,
        rows: [
          {
            id: 1,
            title: 'Game 1',
            developer_id: mockDeveloper.id,
            status: 'approved',
            categories: [{ id: 1, name: 'Action' }],
            tags: [{ id: 1, name: 'RPG' }],
          },
          {
            id: 2,
            title: 'Game 2',
            developer_id: mockDeveloper.id,
            status: 'pending',
            categories: [{ id: 2, name: 'Adventure' }],
            tags: [{ id: 2, name: 'Open World' }],
          },
        ],
      };
      Game.findAndCountAll.mockResolvedValue(mockGames);

      // 执行测试
      await getDeveloperGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取开发者游戏列表成功',
        data: expect.objectContaining({
          games: mockGames.rows,
          pagination: expect.objectContaining({
            currentPage: 1,
            pageSize: 10,
            totalItems: 2,
            totalPages: 1,
          }),
        }),
      }));
    });

    it('should return error if developer account does not exist', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        page: 1,
        limit: 10,
      });
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue(null);

      // 执行测试
      await getDeveloperGames(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '开发者账户不存在',
      }));
    });
  });

  describe('getGameSalesStats', () => {
    it('should get game sales stats successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        gameId: 1,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockSalesStats = [
        {
          dataValues: {
            total_sales: 10,
            total_revenue: 99.99,
            date: '2023-01-01',
          },
        },
      ];
      OrderItem.findAll.mockResolvedValue(mockSalesStats);

      const mockTotalStats = {
        dataValues: {
          total_sales: 100,
          total_revenue: 999.99,
        },
      };
      OrderItem.findOne.mockResolvedValue(mockTotalStats);

      // 执行测试
      await getGameSalesStats(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取游戏销售数据统计成功',
        data: expect.objectContaining({
          daily_stats: mockSalesStats,
          total_stats: expect.any(Object),
        }),
      }));
    });

    it('should return error if developer account does not exist', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        gameId: 1,
      });
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue(null);

      // 执行测试
      await getGameSalesStats(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '开发者账户不存在',
      }));
    });
  });

  describe('getDeveloperEarnings', () => {
    it('should get developer earnings successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        period: 'monthly',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockEarnings = [
        {
          id: 1,
          developer_id: mockDeveloper.id,
          period_start: '2023-01-01',
          period_end: '2023-01-31',
          developer_earnings: 500.00,
          status: 'processed',
        },
      ];
      DeveloperFinance.findAll.mockResolvedValue(mockEarnings);

      const mockCurrentBalance = {
        dataValues: {
          total_earnings: 1000.00,
        },
      };
      DeveloperFinance.findOne.mockResolvedValue(mockCurrentBalance);

      // 执行测试
      await getDeveloperEarnings(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取开发者收益分析成功',
        data: expect.objectContaining({
          earnings: mockEarnings,
          current_balance: 1000.00,
        }),
      }));
    });

    it('should return error if developer account does not exist', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        period: 'monthly',
      });
      const res = mockRes();

      // 模拟依赖函数
      Developer.findOne.mockResolvedValue(null);

      // 执行测试
      await getDeveloperEarnings(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '开发者账户不存在',
      }));
    });
  });

  describe('createWithdrawalRequest', () => {
    it('should create withdrawal request successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({
        amount: 100.00,
        payment_method: 'bank_transfer',
        payment_account: '1234567890',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockCurrentBalance = {
        dataValues: {
          total_earnings: 1000.00,
        },
      };
      DeveloperFinance.findOne.mockResolvedValue(mockCurrentBalance);

      const mockWithdrawalRequest = {
        id: 1,
        developer_id: mockDeveloper.id,
        amount: 100.00,
        payment_method: 'bank_transfer',
        payment_account: '1234567890',
        status: 'pending',
        created_at: new Date(),
      };
      WithdrawalRequest.create.mockResolvedValue(mockWithdrawalRequest);

      // 执行测试
      await createWithdrawalRequest(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '提现请求创建成功',
        data: mockWithdrawalRequest,
      }));
    });

    it('should return error if amount is greater than available balance', async () => {
      // 模拟请求和响应
      const req = mockReq({
        amount: 2000.00,
        payment_method: 'bank_transfer',
        payment_account: '1234567890',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockCurrentBalance = {
        dataValues: {
          total_earnings: 1000.00,
        },
      };
      DeveloperFinance.findOne.mockResolvedValue(mockCurrentBalance);

      // 执行测试
      await createWithdrawalRequest(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: '提现金额超过可用余额',
      }));
    });
  });

  describe('getWithdrawalRequests', () => {
    it('should get withdrawal requests successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        page: 1,
        limit: 10,
        status: 'pending',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockWithdrawalRequests = {
        count: 2,
        rows: [
          {
            id: 1,
            developer_id: mockDeveloper.id,
            amount: 100.00,
            payment_method: 'bank_transfer',
            status: 'pending',
            created_at: new Date(),
          },
          {
            id: 2,
            developer_id: mockDeveloper.id,
            amount: 200.00,
            payment_method: 'paypal',
            status: 'pending',
            created_at: new Date(),
          },
        ],
      };
      WithdrawalRequest.findAndCountAll.mockResolvedValue(mockWithdrawalRequests);

      // 执行测试
      await getWithdrawalRequests(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取提现请求列表成功',
        data: expect.objectContaining({
          requests: mockWithdrawalRequests.rows,
          pagination: expect.objectContaining({
            currentPage: 1,
            pageSize: 10,
            totalItems: 2,
            totalPages: 1,
          }),
        }),
      }));
    });
  });

  describe('getGameAnalytics', () => {
    it('should get game analytics successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        gameId: 1,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        metric: 'sales',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockAnalyticsData = [
        {
          dataValues: {
            date: '2023-01-01',
            value: 10,
          },
        },
        {
          dataValues: {
            date: '2023-01-02',
            value: 15,
          },
        },
      ];
      OrderItem.findAll.mockResolvedValue(mockAnalyticsData);

      // 执行测试
      await getGameAnalytics(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取游戏数据分析成功',
        data: expect.objectContaining({
          metric: 'sales',
          data: expect.any(Array),
        }),
      }));
    });
  });

  describe('getGameComparison', () => {
    it('should get game comparison successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        gameIds: [1, 2],
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      const mockComparisonData = [
        {
          game_id: 1,
          game_title: 'Game 1',
          total_sales: 100,
          total_revenue: 999.99,
          avg_price: 9.99,
        },
        {
          game_id: 2,
          game_title: 'Game 2',
          total_sales: 200,
          total_revenue: 1999.99,
          avg_price: 9.99,
        },
      ];
      OrderItem.findAll.mockResolvedValue(mockComparisonData);

      // 执行测试
      await getGameComparison(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取游戏对比分析成功',
        data: expect.objectContaining({
          comparison: mockComparisonData,
        }),
      }));
    });
  });

  describe('getUserBehaviorAnalytics', () => {
    it('should get user behavior analytics successfully', async () => {
      // 模拟请求和响应
      const req = mockReq({}, {
        gameId: 1,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      });
      const res = mockRes();

      // 模拟依赖函数
      const mockDeveloper = {
        id: 1,
        user_id: req.user.id,
      };
      Developer.findOne.mockResolvedValue(mockDeveloper);

      // 执行测试
      await getUserBehaviorAnalytics(req, res);

      // 验证结果
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: '获取用户行为分析成功',
        data: expect.any(Object),
      }));
    });
  });
});
