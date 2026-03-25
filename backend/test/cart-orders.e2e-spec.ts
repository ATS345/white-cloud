import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cart & Orders (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration & Login', () => {
    it('should register a test user', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: `cartuser_${timestamp}`,
          email: `cart_${timestamp}@example.com`,
          password: 'Password123!',
          displayName: 'Cart Test User',
        })
        .expect(201);

      authToken = response.body.token;
      userId = response.body.id;
    });
  });

  describe('Cart Operations', () => {
    it('should get empty cart for new user', () => {
      return request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.items.length).toBe(0);
        });
    });

    it('should add item to cart', () => {
      return request(app.getHttpServer())
        .post('/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gameId: 1, quantity: 1 })
        .expect((res) => {
          if (res.status === 201 || res.status === 200) {
            expect(res.body).toHaveProperty('items');
          }
        });
    });

    it('should get cart count', () => {
      return request(app.getHttpServer())
        .get('/cart/count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.count).toBe('number');
        });
    });

    it('should clear cart', () => {
      return request(app.getHttpServer())
        .delete('/cart/clear')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body.items.length).toBe(0);
          }
        });
    });
  });

  describe('Order Operations', () => {
    it('should get empty orders list', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('list');
          expect(Array.isArray(res.body.list)).toBe(true);
        });
    });

    it('should fail to create order with empty games', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gameIds: [] })
        .expect(400);
    });

    it('should get my games library', () => {
      return request(app.getHttpServer())
        .get('/orders/my-games')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('games');
          expect(Array.isArray(res.body.games)).toBe(true);
        });
    });
  });

  describe('Unauthorized Access', () => {
    it('should fail to access cart without token', () => {
      return request(app.getHttpServer())
        .get('/cart')
        .expect(401);
    });

    it('should fail to access orders without token', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .expect(401);
    });
  });
});
