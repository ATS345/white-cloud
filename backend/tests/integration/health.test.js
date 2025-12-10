import request from 'supertest';
import { app } from '../../server.js';

// 健康检查集成测试
describe('健康检查 API', () => {
  it('GET /api/v1/health 应该返回 200 OK', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', '木鱼游戏平台API运行正常');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });
});
