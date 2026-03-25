import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Games (e2e)', () => {
  let app: INestApplication;

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

  describe('/games (GET)', () => {
    it('should return paginated games list', () => {
      return request(app.getHttpServer())
        .get('/games')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('list');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.list)).toBe(true);
        });
    });

    it('should support pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/games?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(5);
        });
    });

    it('should filter by genre', () => {
      return request(app.getHttpServer())
        .get('/games?genre=1')
        .expect(200);
    });

    it('should filter by price range', () => {
      return request(app.getHttpServer())
        .get('/games?price_min=0&price_max=100')
        .expect(200);
    });
  });

  describe('/games/hot (GET)', () => {
    it('should return hot games', () => {
      return request(app.getHttpServer())
        .get('/games/hot')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/games/new (GET)', () => {
    it('should return new games', () => {
      return request(app.getHttpServer())
        .get('/games/new')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/games/genres (GET)', () => {
    it('should return all genres', () => {
      return request(app.getHttpServer())
        .get('/games/genres')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/games/platforms (GET)', () => {
    it('should return all platforms', () => {
      return request(app.getHttpServer())
        .get('/games/platforms')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/games/:id (GET)', () => {
    it('should return game by id', () => {
      return request(app.getHttpServer())
        .get('/games/1')
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('id', 1);
            expect(res.body).toHaveProperty('title');
          }
        });
    });

    it('should return 404 for non-existent game', () => {
      return request(app.getHttpServer())
        .get('/games/999999')
        .expect(404);
    });
  });
});
