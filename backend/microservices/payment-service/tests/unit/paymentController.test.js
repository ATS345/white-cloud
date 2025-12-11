// 支付控制器单元测试
import { 
  processPayment, 
  getPaymentStatus, 
  cancelPayment, 
  verifyPayment 
} from '../../controllers/paymentController.js';
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

describe('Payment Controller', () => {
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

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'PENDING',
        update: jest.fn().mockResolvedValue({
          ...mockOrder,
          status: 'COMPLETED',
          transactionId: 'trans456',
          paidAt: expect.any(Date)
        })
      };

      mockReq.body = {
        orderId: 'order123',
        transactionId: 'trans456',
        paymentDetails: { method: 'credit_card' }
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await processPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'COMPLETED',
        transactionId: 'trans456',
        paymentDetails: { method: 'credit_card' }
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '支付处理成功',
        data: expect.objectContaining({
          orderId: 'order123',
          status: 'COMPLETED',
          transactionId: 'trans456'
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when missing required fields', async () => {
      // 准备测试数据 - 缺少必要字段
      mockReq.body = {
        orderId: 'order123',
        // 缺少transactionId
      };

      // 执行测试
      await processPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '缺少必要的支付信息',
        code: 'MISSING_PAYMENT_INFO'
      }));
    });

    it('should throw BadRequestError when order status is not PENDING', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'COMPLETED'
      };

      mockReq.body = {
        orderId: 'order123',
        transactionId: 'trans456'
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await processPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '订单状态无效，当前状态: COMPLETED',
        code: 'INVALID_ORDER_STATUS'
      }));
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'COMPLETED',
        transactionId: 'trans456',
        paymentMethod: 'credit_card',
        amount: 99.99,
        paidAt: new Date(),
        paymentDetails: { method: 'credit_card' }
      };

      mockReq.params = { orderId: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await getPaymentStatus(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取支付状态成功',
        data: expect.objectContaining({
          orderId: 'order123',
          orderStatus: 'COMPLETED',
          transactionId: 'trans456',
          paymentMethod: 'credit_card'
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when order not found', async () => {
      // 准备测试数据
      mockReq.params = { orderId: 'non_existent_id' };
      Order.findByPk.mockResolvedValue(null);

      // 执行测试
      await getPaymentStatus(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('non_existent_id');
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '订单不存在: non_existent_id',
        code: 'ORDER_NOT_FOUND'
      }));
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'PENDING',
        update: jest.fn().mockResolvedValue({
          ...mockOrder,
          status: 'CANCELLED',
          cancelledAt: expect.any(Date)
        })
      };

      mockReq.params = { orderId: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await cancelPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'CANCELLED',
        cancelledAt: expect.any(Date)
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '支付取消成功',
        data: expect.objectContaining({
          orderId: 'order123',
          status: 'CANCELLED'
        })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when order status is not PENDING', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        status: 'COMPLETED'
      };

      mockReq.params = { orderId: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await cancelPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '订单状态无效，当前状态: COMPLETED，无法取消支付',
        code: 'INVALID_ORDER_STATUS'
      }));
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'PENDING',
        amount: 99.99,
        update: jest.fn().mockResolvedValue({
          ...mockOrder,
          status: 'COMPLETED',
          transactionId: 'trans456',
          paidAt: expect.any(Date)
        })
      };

      mockReq.body = {
        orderId: 'order123',
        transactionId: 'trans456',
        status: 'success',
        amount: 99.99,
        paymentDetails: { method: 'credit_card' }
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await verifyPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'COMPLETED',
        transactionId: 'trans456',
        paymentDetails: { method: 'credit_card' },
        paidAt: expect.any(Date)
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '支付结果已处理',
        orderId: 'order123'
      });
    });

    it('should return 404 when order not found in verifyPayment', async () => {
      // 准备测试数据
      mockReq.body = {
        orderId: 'non_existent_id',
        status: 'success'
      };
      Order.findByPk.mockResolvedValue(null);

      // 执行测试
      await verifyPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('non_existent_id');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '订单不存在'
      });
    });

    it('should return 400 when amount mismatch in verifyPayment', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        amount: 99.99
      };

      mockReq.body = {
        orderId: 'order123',
        status: 'success',
        amount: 88.88 // 金额不匹配
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await verifyPayment(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '支付金额不匹配'
      });
    });
  });
});
