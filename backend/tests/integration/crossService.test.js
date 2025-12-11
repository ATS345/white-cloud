import request from 'supertest';
import { app as mainApp } from '../../server.js';
import paymentApp from '../../microservices/payment-service/server.js';
import notificationApp from '../../microservices/notification-service/server.js';

// 跨服务集成测试
describe('跨服务集成测试', () => {
  // 测试环境设置
  beforeAll(() => {
    console.log('开始跨服务集成测试...');
  });

  afterAll(() => {
    console.log('跨服务集成测试结束...');
  });

  describe('支付服务与通知服务集成', () => {
    it('创建订单后应该生成相关通知', async () => {
      // 模拟用户信息
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user'
      };

      // 模拟订单数据
      const orderData = {
        userId: mockUser.id,
        gameId: 'game123',
        amount: 99.99,
        paymentMethod: 'credit_card',
        gameTitle: 'Test Game',
        gamePrice: 99.99,
        gameImage: 'test.jpg'
      };

      // 1. 创建订单
      const orderResponse = await request(paymentApp)
        .post('/api/v1/orders')
        .send(orderData)
        .set('Authorization', `Bearer mock-jwt-token`);

      // 验证订单创建成功
      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data).toHaveProperty('id');
      const orderId = orderResponse.body.data.id;

      // 2. 验证通知服务是否生成了订单相关通知
      const notificationsResponse = await request(notificationApp)
        .get(`/api/v1/notifications/user/${mockUser.id}`)
        .set('Authorization', `Bearer mock-jwt-token`);

      // 验证通知生成成功
      expect(notificationsResponse.status).toBe(200);
      expect(notificationsResponse.body.success).toBe(true);
      expect(notificationsResponse.body.data.notifications).toBeInstanceOf(Array);
      
      // 检查是否有与该订单相关的通知
      const orderNotifications = notificationsResponse.body.data.notifications.filter(notification => 
        notification.referenceId === orderId || notification.content.includes('订单')
      );
      
      expect(orderNotifications.length).toBeGreaterThan(0);
    });
  });

  describe('健康检查集成测试', () => {
    it('所有服务健康检查都应该返回正常', async () => {
      // 主服务健康检查
      const mainHealth = await request(mainApp).get('/api/v1/health');
      expect(mainHealth.status).toBe(200);
      expect(mainHealth.body.success).toBe(true);

      // 支付服务健康检查
      const paymentHealth = await request(paymentApp).get('/health');
      expect(paymentHealth.status).toBe(200);
      expect(paymentHealth.body.success).toBe(true);

      // 通知服务健康检查
      const notificationHealth = await request(notificationApp).get('/health');
      expect(notificationHealth.status).toBe(200);
      expect(notificationHealth.body.success).toBe(true);
    });
  });
});
