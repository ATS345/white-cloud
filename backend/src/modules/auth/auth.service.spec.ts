import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should return payload when token is valid', async () => {
      const mockPayload = { userId: 1, email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should return null when token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('refreshTokens', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return new tokens when refresh token is valid', async () => {
      const mockPayload = { userId: 1, email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockJwtService.sign.mockReturnValue('new-token');

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toEqual({
        token: 'new-token',
        refreshToken: 'new-token',
      });
    });

    it('should return null when refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.refreshTokens('invalid-refresh-token');

      expect(result).toBeNull();
    });
  });
});
