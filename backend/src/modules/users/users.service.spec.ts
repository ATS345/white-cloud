import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../../config/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-token"),
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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerDto = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        ...registerDto,
        passwordHash: "hashedpassword",
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should throw conflict exception if user exists", async () => {
      const registerDto = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 1,
        username: "testuser",
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        "用户名或邮箱已存在",
      );
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashedpassword",
        username: "testuser",
        displayName: "Test User",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should throw not found exception if user not found", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow("用户不存在");
    });

    it("should throw conflict exception if password is wrong", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashedpassword",
        username: "testuser",
        displayName: "Test User",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow("密码错误");
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const changePasswordDto = {
        oldPassword: "oldpassword",
        newPassword: "newpassword",
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        passwordHash: "hashedpassword",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newhashedpassword");

      const result = await service.changePassword(1, changePasswordDto);

      expect(result).toBeDefined();
    });

    it("should throw conflict exception if old password is wrong", async () => {
      const changePasswordDto = {
        oldPassword: "oldpassword",
        newPassword: "newpassword",
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        passwordHash: "hashedpassword",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow("原密码错误");
    });
  });
});
