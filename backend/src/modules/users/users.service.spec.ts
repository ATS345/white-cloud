import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../config/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    displayName: 'Test User',
    avatar: null,
    bio: null,
    location: null,
    website: null,
    role: 'user',
    status: 'active',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateDto = { displayName: 'New Name' };
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, displayName: 'New Name' });

      const result = await service.updateUser(1, updateDto);

      expect(result.displayName).toBe('New Name');
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      oldPassword: 'oldpassword',
      newPassword: 'newpassword',
    };

    it('should change password successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword(1, changePasswordDto);

      expect(result).toHaveProperty('message', '密码修改成功');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(999, changePasswordDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if old password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(ConflictException);
    });
  });
});
