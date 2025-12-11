// 订单控制器单元测试
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrder, 
  deleteOrder,
  getOrderStats 
} from '../../controllers/orderController.js';
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

describe('Order Controller', () => {
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

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      // 准备测试数据
      const mockOrderData = {
        userId: 'user123',
        gameId: 'game456',
        amount: 99.99,
        paymentMethod: 'credit_card',
        gameTitle: 'Test Game',
        gamePrice: 99.99,
        gameImage: 'test.jpg'
      };
      const mockOrder = { ...mockOrderData, id: 'order789', status: 'PENDING' };

      mockReq.body = mockOrderData;
      Order.create.mockResolvedValue(mockOrder);

      // 执行测试
      await createOrder(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.create).toHaveBeenCalledWith(expect.objectContaining(mockOrderData));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '订单创建成功',
        data: mockOrder
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when missing required fields', async () => {
      // 准备测试数据 - 缺少必要字段
      mockReq.body = {
        userId: 'user123',
        gameId: 'game456',
        amount: 99.99,
        // 缺少paymentMethod, gameTitle, gamePrice
      };

      // 执行测试
      await createOrder(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.create).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '缺少必要的订单信息',
        code: 'MISSING_ORDER_INFO'
      }));
    });
  });

  describe('getOrders', () => {
    it('should get orders list with pagination', async () => {
      // 准备测试数据
      const mockOrders = [
        { id: 'order1', userId: 'user123', status: 'COMPLETED', amount: 99.99 },
        { id: 'order2', userId: 'user123', status: 'COMPLETED', amount: 199.99 }
      ];
      const mockCount = 2;

      mockReq.query = { page: '1', limit: '10' };
      Order.findAndCountAll.mockResolvedValue({ count: mockCount, rows: mockOrders });

      // 执行测试
      await getOrders(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findAndCountAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取订单列表成功',
        data: {
          orders: mockOrders,
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

    it('should get orders with filters', async () => {
      // 准备测试数据
      const mockOrders = [
        { id: 'order1', userId: 'user123', status: 'COMPLETED', amount: 99.99 }
      ];
      const mockCount = 1;

      mockReq.query = { userId: 'user123', status: 'COMPLETED' };
      Order.findAndCountAll.mockResolvedValue({ count: mockCount, rows: mockOrders });

      // 执行测试
      await getOrders(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          userId: 'user123',
          status: 'COMPLETED'
        }
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      // 准备测试数据
      const mockOrder = { id: 'order123', userId: 'user123', status: 'COMPLETED' };

      mockReq.params = { id: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await getOrderById(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取订单详情成功',
        data: mockOrder
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when order not found', async () => {
      // 准备测试数据
      mockReq.params = { id: 'non_existent_id' };
      Order.findByPk.mockResolvedValue(null);

      // 执行测试
      await getOrderById(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('non_existent_id');
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '订单不存在: non_existent_id',
        code: 'ORDER_NOT_FOUND'
      }));
    });
  });

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'PENDING',
        update: jest.fn().mockResolvedValue({ ...mockOrder, status: 'COMPLETED' })
      };

      mockReq.params = { id: 'order123' };
      mockReq.body = { status: 'COMPLETED' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await updateOrder(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'COMPLETED' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '订单更新成功',
        data: expect.objectContaining({ status: 'COMPLETED' })
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when order not found for update', async () => {
      // 准备测试数据
      mockReq.params = { id: 'non_existent_id' };
      mockReq.body = { status: 'COMPLETED' };
      Order.findByPk.mockResolvedValue(null);

      // 执行测试
      await updateOrder(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('non_existent_id');
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '订单不存在: non_existent_id',
        code: 'ORDER_NOT_FOUND'
      }));
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully when status is PENDING', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'PENDING',
        destroy: jest.fn().mockResolvedValue(true)
      };

      mockReq.params = { id: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await deleteOrder(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockOrder.destroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '订单删除成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when order status is not PENDING', async () => {
      // 准备测试数据
      const mockOrder = {
        id: 'order123',
        userId: 'user123',
        status: 'COMPLETED'
      };

      mockReq.params = { id: 'order123' };
      Order.findByPk.mockResolvedValue(mockOrder);

      // 执行测试
      await deleteOrder(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findByPk).toHaveBeenCalledWith('order123');
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: '只有待支付的订单才能被删除',
        code: 'ORDER_CANNOT_BE_DELETED'
      }));
    });
  });

  describe('getOrderStats', () => {
    it('should get order stats successfully', async () => {
      // 准备测试数据
      const mockStats = [
        { dataValues: { status: 'COMPLETED', count: '2', totalAmount: '199.98' } },
        { dataValues: { status: 'PENDING', count: '1', totalAmount: '99.99' } }
      ];

      mockReq.params = { userId: 'user123' };
      Order.findAll.mockResolvedValue(mockStats);

      // 执行测试
      await getOrderStats(mockReq, mockRes, mockNext);

      // 验证结果
      expect(Order.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user123' },
        group: ['status']
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '获取订单统计信息成功',
        data: {
          stats: mockStats,
          totalOrders: 3,
          totalAmount: 299.97
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
