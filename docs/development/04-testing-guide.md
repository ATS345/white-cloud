# 云幕游戏商店平台 - 测试指南

## 文档概述

本文档提供了云幕游戏商店平台的测试指南，包括测试策略、测试类型、测试工具和最佳实践。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**维护团队**: 云幕测试团队

---

## 目录

1. [测试策略概述](#1-测试策略概述)
2. [测试类型](#2-测试类型)
3. [测试工具](#3-测试工具)
4. [单元测试](#4-单元测试)
5. [集成测试](#5-集成测试)
6. [E2E测试](#6-e2e测试)
7. [测试覆盖率](#7-测试覆盖率)
8. [测试最佳实践](#8-测试最佳实践)

---

## 1. 测试策略概述

### 1.1 测试金字塔

```
        /\
       /  \      E2E测试 (10%)
      /----\     
     /      \    集成测试 (20%)
    /--------\
   /          \  单元测试 (70%)
  /------------\
```

### 1.2 测试目标

- **功能正确性**: 确保功能按预期工作
- **代码质量**: 通过测试驱动开发提高代码质量
- **回归保护**: 防止新代码破坏现有功能
- **文档作用**: 测试用例作为代码的使用文档

### 1.3 测试原则

1. **快速**: 测试应该快速执行
2. **独立**: 测试之间不应有依赖
3. **可重复**: 测试结果应该可重复
4. **自验证**: 测试应该自动验证结果
5. **及时**: 测试应该及时编写

---

## 2. 测试类型

### 2.1 单元测试

- **目标**: 测试单个函数或组件
- **范围**: 最小可测试单元
- **速度**: 毫秒级
- **覆盖率目标**: ≥ 80%

### 2.2 集成测试

- **目标**: 测试模块间的交互
- **范围**: 多个模块组合
- **速度**: 秒级
- **覆盖率目标**: ≥ 60%

### 2.3 E2E测试

- **目标**: 测试完整的用户流程
- **范围**: 整个应用
- **速度**: 分钟级
- **覆盖率目标**: 关键路径100%

### 2.4 性能测试

- **目标**: 测试系统性能指标
- **范围**: API响应时间、并发处理
- **工具**: Artillery, k6

### 2.5 安全测试

- **目标**: 发现安全漏洞
- **范围**: 认证、授权、数据安全
- **工具**: OWASP ZAP, npm audit

---

## 3. 测试工具

### 3.1 前端测试工具

| 工具 | 用途 | 配置文件 |
|------|------|---------|
| **Jest** | 单元测试框架 | `jest.config.js` |
| **React Testing Library** | React组件测试 | - |
| **Cypress** | E2E测试 | `cypress.config.ts` |
| **MSW** | API Mock | - |

### 3.2 后端测试工具

| 工具 | 用途 | 配置文件 |
|------|------|---------|
| **Jest** | 单元测试框架 | `jest.config.js` |
| **Supertest** | API测试 | - |
| **Prisma Test Utils** | 数据库测试 | - |

### 3.3 安装测试依赖

```bash
# 前端测试依赖
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event cypress msw

# 后端测试依赖
cd backend
npm install --save-dev jest @types/jest supertest @types/supertest
```

---

## 4. 单元测试

### 4.1 测试文件命名

- 测试文件与源文件同名，添加 `.test.ts` 或 `.spec.ts` 后缀
- 测试文件放在与源文件相同的目录

```
src/
├── utils/
│   ├── api.ts
│   └── api.test.ts
├── services/
│   ├── userService.ts
│   └── userService.test.ts
```

### 4.2 Jest配置

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 4.3 单元测试示例

```typescript
// src/utils/stringUtils.test.ts
import { capitalize, truncate } from './stringUtils';

describe('StringUtils', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });

  describe('truncate', () => {
    it('should truncate long string', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('should not truncate short string', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });
  });
});
```

### 4.4 React组件测试

```typescript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

---

## 5. 集成测试

### 5.1 API集成测试

```typescript
// backend/src/modules/users/users.controller.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.username).toBe('testuser');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.token).toBeDefined();
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com', // 已存在的邮箱
          password: 'password123',
          displayName: 'Test User 2',
        })
        .expect(409);
    });
  });
});
```

### 5.2 数据库集成测试

```typescript
// backend/src/modules/games/games.service.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from '../../config/prisma/prisma.service';

describe('GamesService', () => {
  let service: GamesService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesService, PrismaService],
    }).compile();

    service = module.get<GamesService>(GamesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 清理测试数据
    await prisma.game.deleteMany();
  });

  describe('findAll', () => {
    it('should return paginated games', async () => {
      // 创建测试数据
      await prisma.game.createMany({
        data: [
          { title: 'Game 1', slug: 'game-1', price: 100 },
          { title: 'Game 2', slug: 'game-2', price: 200 },
        ],
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.list).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });
});
```

---

## 6. E2E测试

### 6.1 Cypress配置

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
});
```

### 6.2 E2E测试示例

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should register a new user', () => {
    cy.get('[data-testid="register-link"]').click();
    
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="confirm-password-input"]').type('password123');
    
    cy.get('[data-testid="register-button"]').click();
    
    cy.url().should('include', '/');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should login existing user', () => {
    cy.get('[data-testid="login-link"]').click();
    
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="login-link"]').click();
    
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('.ant-message-error').should('be.visible');
  });
});
```

### 6.3 购物流程E2E测试

```typescript
// cypress/e2e/shopping.cy.ts
describe('Shopping Flow', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
  });

  it('should complete purchase flow', () => {
    // 浏览游戏
    cy.visit('/games');
    cy.get('[data-testid="game-card"]').first().click();
    
    // 添加到购物车
    cy.get('[data-testid="add-to-cart-button"]').click();
    cy.get('.ant-message-success').should('be.visible');
    
    // 查看购物车
    cy.get('[data-testid="cart-icon"]').click();
    cy.url().should('include', '/cart');
    
    // 结算
    cy.get('[data-testid="checkout-button"]').click();
    cy.url().should('include', '/checkout');
    
    // 选择支付方式
    cy.get('[data-testid="payment-alipay"]').click();
    cy.get('[data-testid="pay-button"]').click();
    
    // 验证订单创建
    cy.url().should('include', '/orders');
    cy.get('[data-testid="order-item"]').should('be.visible');
  });
});
```

---

## 7. 测试覆盖率

### 7.1 运行覆盖率测试

```bash
# 前端
npm run test:coverage

# 后端
cd backend
npm run test:cov
```

### 7.2 覆盖率目标

| 类型 | 目标 | 最低要求 |
|------|------|---------|
| 语句覆盖率 | 80% | 70% |
| 分支覆盖率 | 80% | 70% |
| 函数覆盖率 | 80% | 70% |
| 行覆盖率 | 80% | 70% |

### 7.3 覆盖率报告

测试完成后会生成覆盖率报告：

- **HTML报告**: `coverage/lcov-report/index.html`
- **JSON报告**: `coverage/coverage-final.json`
- **LCOV报告**: `coverage/lcov.info`

---

## 8. 测试最佳实践

### 8.1 测试命名

```typescript
// 使用describe/it结构
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', () => {
      // 测试代码
    });

    it('should throw error with invalid email', () => {
      // 测试代码
    });
  });
});
```

### 8.2 AAA模式

```typescript
it('should calculate total price correctly', () => {
  // Arrange (准备)
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 3 },
  ];
  const service = new CartService();

  // Act (执行)
  const total = service.calculateTotal(items);

  // Assert (断言)
  expect(total).toBe(350);
});
```

### 8.3 测试隔离

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new UserService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find user by id', async () => {
    mockRepository.findById.mockResolvedValue({ id: 1, name: 'Test' });
    
    const result = await service.findById(1);
    
    expect(result).toBeDefined();
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });
});
```

### 8.4 Mock最佳实践

```typescript
// 模拟API调用
jest.mock('@/utils/api');
const mockedApi = api as jest.Mocked<typeof api>;

it('should fetch user data', async () => {
  mockedApi.get.mockResolvedValue({ id: 1, name: 'Test' });
  
  const result = await fetchUser(1);
  
  expect(result).toEqual({ id: 1, name: 'Test' });
  expect(mockedApi.get).toHaveBeenCalledWith('/users/1');
});
```

---

## 相关文档

- [编码规范](./02-coding-standards.md)
- [Git工作流程](./03-git-workflow.md)
- [API接口规范](../api/01-api-specification.md)

---

## 联系方式

- **测试团队**: qa@cloudcurtain.com
- **技术支持**: tech@cloudcurtain.com

---

**文档维护团队**: 云幕测试团队  
**最后更新**: 2026-03-14
