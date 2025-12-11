// 评论控制器单元测试
import {
  createReview,
  getGameReviews,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  likeReview,
  dislikeReview,
  getGameReviewStats
} from '../../controllers/reviewController.js';
import Review from '../../models/Review.js';
import { ValidationError, NotFoundError } from '../../utils/errors.js';
import { setCache, getCache, deleteCache } from '../../config/redis.js';

// 模拟依赖
jest.mock('../../models/Review.js');
jest.mock('../../config/redis.js');

// 测试用例配置
const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Review Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = mockRequest();
    mockRes = mockResponse();
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create a new review successfully', async () => {
      // 准备测试数据
      const mockReviewData = {
        userId: 'user123',
        gameId: 'game456',
        gameTitle: 'Test Game',
        rating: 5,
        content: 'This is a great game!',
        parentId: null
      };
      const mockReview = { ...mockReviewData, id: 'review789', status: 'APPROVED' };

      mockReq.body = mockReviewData;
      Review.create.mockResolvedValue(mockReview);
      setCache.mockResolvedValue(true);
      deleteCache.mockResolvedValue(true);

      // 执行测试
      await createReview(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.create).toHaveBeenCalledWith(expect.objectContaining(mockReviewData));
      expect(deleteCache).toHaveBeenCalledTimes(3);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '评论创建成功',
        data: mockReview
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when missing required fields', async () => {
      // 准备测试数据 - 缺少必要字段
      mockReq.body = {
        userId: 'user123',
        gameId: 'game456',
        // 缺少gameTitle, rating, content
      };

      // 执行测试
      await createReview(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.create).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '缺少必要的评论信息',
        code: 'MISSING_REVIEW_INFO'
      }));
    });

    it('should throw ValidationError when rating is out of range', async () => {
      // 准备测试数据 - 评分超出范围
      mockReq.body = {
        userId: 'user123',
        gameId: 'game456',
        gameTitle: 'Test Game',
        rating: 6, // 评分超出1-5范围
        content: 'This is a great game!'
      };

      // 执行测试
      await createReview(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.create).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '评分必须在1-5之间',
        code: 'INVALID_RATING'
      }));
    });
  });

  describe('getGameReviews', () => {
    it('should get game reviews successfully from cache', async () => {
      // 准备测试数据
      const mockReviews = [
        { id: 'review1', gameId: 'game456', rating: 5, content: 'Great game!' },
        { id: 'review2', gameId: 'game456', rating: 4, content: 'Good game!' }
      ];
      const mockStats = {
        reviews: mockReviews,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };

      mockReq.params = { gameId: 'game456' };
      mockReq.query = { page: '1', limit: '10' };
      getCache.mockResolvedValue(mockStats);

      // 执行测试
      await getGameReviews(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(Review.findAndCountAll).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '从缓存获取评论列表成功',
        data: mockStats
      });
    });

    it('should get game reviews successfully from database', async () => {
      // 准备测试数据
      const mockReviews = [
        { id: 'review1', gameId: 'game456', rating: 5, content: 'Great game!' },
        { id: 'review2', gameId: 'game456', rating: 4, content: 'Good game!' }
      ];
      const mockStats = {
        count: 2,
        rows: mockReviews
      };

      mockReq.params = { gameId: 'game456' };
      mockReq.query = { page: '1', limit: '10' };
      getCache.mockResolvedValue(null);
      Review.findAndCountAll.mockResolvedValue(mockStats);
      setCache.mockResolvedValue(true);

      // 执行测试
      await getGameReviews(mockReq, mockRes, mockNext);

      // 验证结果
      expect(getCache).toHaveBeenCalled();
      expect(Review.findAndCountAll).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取游戏评论列表成功',
        data: {
          reviews: mockReviews,
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        }
      });
    });
  });

  describe('getReviewById', () => {
    it('should get review by id successfully', async () => {
      // 准备测试数据
      const mockReview = {
        id: 'review123',
        userId: 'user123',
        gameId: 'game456',
        rating: 5,
        content: 'Great game!'
      };

      mockReq.params = { id: 'review123' };
      getCache.mockResolvedValue(null);
      Review.findByPk.mockResolvedValue(mockReview);
      setCache.mockResolvedValue(true);

      // 执行测试
      await getReviewById(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.findByPk).toHaveBeenCalledWith('review123', expect.any(Object));
      expect(setCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取评论详情成功',
        data: mockReview
      });
    });

    it('should throw NotFoundError when review not found', async () => {
      // 准备测试数据
      mockReq.params = { id: 'non_existent_id' };
      getCache.mockResolvedValue(null);
      Review.findByPk.mockResolvedValue(null);

      // 执行测试
      await getReviewById(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.findByPk).toHaveBeenCalledWith('non_existent_id', expect.any(Object));
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '评论不存在: non_existent_id',
        code: 'REVIEW_NOT_FOUND'
      }));
    });
  });

  describe('updateReview', () => {
    it('should update review successfully', async () => {
      // 准备测试数据
      const mockReview = {
        id: 'review123',
        userId: 'user123',
        gameId: 'game456',
        rating: 5,
        content: 'Great game!',
        status: 'APPROVED',
        update: jest.fn().mockResolvedValue({
          ...mockReview,
          rating: 4,
          content: 'Good game!'
        })
      };

      mockReq.params = { id: 'review123' };
      mockReq.body = { rating: 4, content: 'Good game!' };
      Review.findByPk.mockResolvedValue(mockReview);
      deleteCache.mockResolvedValue(true);

      // 执行测试
      await updateReview(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.findByPk).toHaveBeenCalledWith('review123');
      expect(mockReview.update).toHaveBeenCalledWith({ rating: 4, content: 'Good game!', status: 'APPROVED' });
      expect(deleteCache).toHaveBeenCalledTimes(4);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '评论更新成功',
        data: expect.objectContaining({ rating: 4, content: 'Good game!' })
      });
    });
  });

  describe('deleteReview', () => {
    it('should delete review successfully', async () => {
      // 准备测试数据
      const mockReview = {
        id: 'review123',
        userId: 'user123',
        gameId: 'game456',
        destroy: jest.fn().mockResolvedValue(true)
      };

      mockReq.params = { id: 'review123' };
      Review.findByPk.mockResolvedValue(mockReview);
      deleteCache.mockResolvedValue(true);

      // 执行测试
      await deleteReview(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.findByPk).toHaveBeenCalledWith('review123');
      expect(mockReview.destroy).toHaveBeenCalled();
      expect(deleteCache).toHaveBeenCalledTimes(4);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '评论删除成功'
      });
    });
  });

  describe('likeReview', () => {
    it('should like a review successfully', async () => {
      // 准备测试数据
      const mockReview = {
        id: 'review123',
        userId: 'user123',
        gameId: 'game456',
        likes: 0,
        dislikes: 0,
        update: jest.fn().mockResolvedValue({ likes: 1, dislikes: 0 })
      };

      mockReq.params = { id: 'review123' };
      Review.findByPk.mockResolvedValue(mockReview);
      deleteCache.mockResolvedValue(true);

      // 执行测试
      await likeReview(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.findByPk).toHaveBeenCalledWith('review123');
      expect(mockReview.update).toHaveBeenCalledWith({ likes: 1 });
      expect(deleteCache).toHaveBeenCalledTimes(3);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '评论点赞成功',
        data: { likes: 1, dislikes: 0 }
      });
    });
  });

  describe('dislikeReview', () => {
    it('should dislike a review successfully', async () => {
      // 准备测试数据
      const mockReview = {
        id: 'review123',
        userId: 'user123',
        gameId: 'game456',
        likes: 0,
        dislikes: 0,
        update: jest.fn().mockResolvedValue({ likes: 0, dislikes: 1 })
      };

      mockReq.params = { id: 'review123' };
      Review.findByPk.mockResolvedValue(mockReview);
      deleteCache.mockResolvedValue(true);

      // 执行测试
      await dislikeReview(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.findByPk).toHaveBeenCalledWith('review123');
      expect(mockReview.update).toHaveBeenCalledWith({ dislikes: 1 });
      expect(deleteCache).toHaveBeenCalledTimes(3);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '评论踩成功',
        data: { likes: 0, dislikes: 1 }
      });
    });
  });

  describe('getGameReviewStats', () => {
    it('should get game review stats successfully', async () => {
      // 准备测试数据
      const mockStats = [
        { rating: 5, dataValues: { count: '2' } },
        { rating: 4, dataValues: { count: '1' } }
      ];

      mockReq.params = { gameId: 'game456' };
      getCache.mockResolvedValue(null);
      Review.findAll.mockResolvedValue(mockStats);
      setCache.mockResolvedValue(true);

      // 执行测试
      await getGameReviewStats(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Review.findAll).toHaveBeenCalled();
      expect(setCache).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取评论统计成功',
        data: {
          averageRating: 4.7,
          totalReviews: 3,
          ratingDistribution: [
            { rating: 5, count: 2 },
            { rating: 4, count: 1 }
          ]
        }
      });
    });
  });
});
