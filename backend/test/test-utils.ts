import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  await app.init();
  return app;
}

export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  nickname: 'Test User',
  avatar: null,
  balance: 100,
  role: 'user',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockGame = {
  id: 1,
  title: 'Test Game',
  slug: 'test-game',
  description: 'A test game for testing',
  price: 99.99,
  originalPrice: 129.99,
  discount: 23,
  coverImage: 'https://example.com/cover.jpg',
  developer: 'Test Developer',
  publisher: 'Test Publisher',
  releaseDate: new Date('2024-01-01'),
  rating: 4.5,
  reviewCount: 100,
  downloadCount: 1000,
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOrder = {
  id: 1,
  orderNo: 'ORD202401010001',
  userId: 1,
  totalAmount: 99.99,
  status: 'pending',
  paymentMethod: 'alipay',
  createdAt: new Date(),
  updatedAt: new Date(),
};
