// 退款控制器单元测试
import { 
  requestRefund, 
  processRefund, 
  getRefundStatus, 
  getRefundList,
  cancelRefund 
} from '../../controllers/refundController.js';
import Order from '../../models/Order.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

// 模拟依赖
jest.mock('../../models/Order.js');

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

describe('Refund Controller', () => {
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

  describe('requestRefund', () => {
    it('should request refund successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'COMPLETED',
        amount: 99.99,
        refundStatus: 'NOT_REQUESTED',
        update: jest.fn().mockResolvedValue({
          ...mockOrder,
          refundStatus: 'REQUESTED',
          refundReason: 'Test refund reason',
          refundAmount: 99.99,
          refundRequestedAt: expect.any(Date)
        })
      };

      mockReq.body = {
        orderId: 'order123',
        reason: 'Test refund reason'
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await requestRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        refundStatus: 'REQUESTED',
        refundReason: 'Test refund reason',
        refundAmount: 99.99,
        refundRequestedAt: expect.any(Date)
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '退款申请已提交',
        data: expect.objectContaining({
          orderId: 'order123',
          refundStatus: 'REQUESTED',
          refundAmount: 99.99,
          refundReason: 'Test refund reason'
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when order status is not COMPLETED', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'PENDING',
        refundStatus: 'NOT_REQUESTED'
      };

      mockReq.body = {
        orderId: 'order123',
        reason: 'Test refund reason'
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await requestRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '订单状态无效，当前状态: PENDING，只有已完成的订单才能申请退款',
        code: 'INVALID_ORDER_STATUS'
      }));
    });

    it('should throw BadRequestError when refund amount exceeds order amount', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'COMPLETED',
        amount: 99.99,
        refundStatus: 'NOT_REQUESTED'
      };

      mockReq.body = {
        orderId: 'order123',
        reason: 'Test refund reason',
        amount: 199.99 // 超过订单金额
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await requestRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '退款金额不能超过订单总金额',
        code: 'INVALID_REFUND_AMOUNT'
      }));
    });
  });

  describe('processRefund', () => {
    it('should approve refund successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'COMPLETED',
        refundStatus: 'REQUESTED',
        refundAmount: 99.99,
        refundReason: 'Test refund reason',
        update: jest.fn().mockResolvedValue({
          ...mockOrder,
          refundStatus: 'COMPLETED',
          refundProcessedAt: expect.any(Date),
          refundNotes: 'Refund approved'
        })
      };

      mockReq.body = {
        orderId: 'order123',
        action: 'approve',
        notes: 'Refund approved'
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await processRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        refundStatus: 'COMPLETED',
        refundProcessedAt: expect.any(Date),
        refundNotes: 'Refund approved'
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '退款已批准',
        data: expect.objectContaining({
          orderId: 'order123',
          refundStatus: 'COMPLETED'
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject refund successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'COMPLETED',
        refundStatus: 'REQUESTED',
        refundAmount: 99.99,
        refundReason: 'Test refund reason',
        update: jest.fn().mockResolvedValue({
          ...mockOrder,
          refundStatus: 'REJECTED',
          refundProcessedAt: expect.any(Date),
          refundNotes: 'Refund rejected'
        })
      };

      mockReq.body = {
        orderId: 'order123',
        action: 'reject',
        notes: 'Refund rejected'
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await processRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        refundStatus: 'REJECTED',
        refundProcessedAt: expect.any(Date),
        refundNotes: 'Refund rejected'
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '退款已拒绝',
        data: expect.objectContaining({
          orderId: 'order123',
          refundStatus: 'REJECTED'
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when refund status is not REQUESTED', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'COMPLETED',
        refundStatus: 'COMPLETED' // 已经完成退款
      };

      mockReq.body = {
        orderId: 'order123',
        action: 'approve'
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await processRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '退款状态无效，当前状态: COMPLETED，只有已申请的退款才能处理',
        code: 'INVALID_REFUND_STATUS'
      }));
    });
  });

  describe('getRefundStatus', () => {
    it('should get refund status successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'COMPLETED',
        refundStatus: 'COMPLETED',
        refundAmount: 99.99,
        refundReason: 'Test refund reason',
        refundRequestedAt: new Date(),
        refundProcessedAt: new Date(),
        refundNotes: 'Refund approved'
      };

      mockReq.params = { orderId: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await getRefundStatus(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取退款状态成功',
        data: expect.objectContaining({
          orderId: 'order123',
          orderStatus: 'COMPLETED',
          refundStatus: 'COMPLETED',
          refundAmount: 99.99
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when order not found', async () => {
      // 准备测试数据
      mockReq.params = { orderId: 'non_existent_id' };
      Order.findByPk.mockResolvedValue(null);

      // 执行测试
      await getRefundStatus(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('non_existent_id');
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '订单不存在: non_existent_id',
        code: 'ORDER_NOT_FOUND'
      }));
    });
  });

  describe('getRefundList', () => {
    it('should get refund list with pagination', async () => {
      // 准备测试数据
      const mockRefunds = [
        {
          id: 'order1',
          userId: 'user123',
          status: 'COMPLETED',
          refundStatus: 'COMPLETED',
          refundAmount: 99.99
        },
        {
          id: 'order2',
          userId: 'user123',
          status: 'COMPLETED',
          refundStatus: 'REJECTED',
          refundAmount: 199.99
        }
      ];
      const mockCount = 2;

      mockReq.query = { page: '1', limit: '10' };
      Order.findAndCountAll.mockResolvedValue({ count: mockCount, rows: mockRefunds });

      // 执行测试
      await getRefundList(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findAndCountAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取退款列表成功',
        data: {
          refunds: mockRefunds,
          pagination: {
            total: mockCount,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('cancelRefund', () => {
    it('should cancel refund successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'COMPLETED',
        refundStatus: 'REQUESTED',
        update: jest.fn().mockResolvedValue({
          ...mockOrder,
          refundStatus: 'CANCELLED',
          refundCancelledAt: expect.any(Date)
        })
      };

      mockReq.params = { orderId: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await cancelRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        refundStatus: 'CANCELLED',
        refundCancelledAt: expect.any(Date)
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '退款申请已取消',
        data: expect.objectContaining({
          orderId: 'order123',
          refundStatus: 'CANCELLED'
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when refund status is not REQUESTED for cancel', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'COMPLETED',
        refundStatus: 'COMPLETED' // 已经完成退款
      };

      mockReq.params = { orderId: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await cancelRefund(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '退款状态无效，当前状态: COMPLETED，只有已申请的退款才能取消',
        code: 'INVALID_REFUND_STATUS'
      }));
    });
  });
});
