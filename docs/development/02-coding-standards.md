# 云幕游戏商店平台 - 编码规范

## 文档概述

本文档定义了云幕游戏商店平台的编码规范，确保代码质量、可维护性和团队协作效率。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**维护团队**: 云幕开发团队

---

## 目录

1. [通用规范](#1-通用规范)
2. [TypeScript规范](#2-typescript规范)
3. [React规范](#3-react规范)
4. [后端规范](#4-后端规范)
5. [命名约定](#5-命名约定)
6. [注释规范](#6-注释规范)
7. [代码审查标准](#7-代码审查标准)

---

## 1. 通用规范

### 1.1 文件编码

- 所有源文件使用 **UTF-8** 编码
- 文件末尾保留一个空行
- 使用 **LF** 换行符（Linux/macOS风格）

### 1.2 缩进和空格

- 使用 **2个空格** 进行缩进（不使用Tab）
- 运算符两侧保留空格
- 逗号后保留空格
- 冒号后保留空格

```typescript
// 正确
const user = {
  name: 'John',
  age: 30,
};

const result = a + b;

// 错误
const user={
  name:'John',
  age:30,
};
```

### 1.3 行长度

- 每行代码不超过 **100** 个字符
- 超过限制时进行换行

### 1.4 代码格式化

使用 Prettier 进行代码格式化，配置文件：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 2. TypeScript规范

### 2.1 类型定义

- **始终使用显式类型定义**
- 避免使用 `any` 类型
- 使用接口定义对象类型
- 使用类型别名定义联合类型和交叉类型

```typescript
// 正确
interface User {
  id: number;
  name: string;
  email: string;
}

type Status = 'active' | 'inactive' | 'pending';

// 错误
const user: any = { ... };
```

### 2.2 接口命名

- 接口名称使用 **PascalCase**
- 不使用 `I` 前缀

```typescript
// 正确
interface UserService { }
interface GameData { }

// 错误
interface IUserService { }
interface IGameData { }
```

### 2.3 类型导入

- 使用 `import type` 导入类型
- 使用 `export type` 导出类型

```typescript
// 正确
import type { User } from './types';
export type { User };

// 错误
import { User } from './types';
```

### 2.4 函数定义

- 函数参数和返回值必须有类型定义
- 使用箭头函数作为回调

```typescript
// 正确
const fetchUser = async (id: number): Promise<User> => {
  return await api.get(`/users/${id}`);
};

const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);

// 错误
const fetchUser = async (id) => {
  return await api.get(`/users/${id}`);
};
```

### 2.5 空值检查

- 使用严格空值检查
- 使用可选链操作符 `?.`
- 使用空值合并操作符 `??`

```typescript
// 正确
const userName = user?.name ?? 'Unknown';

if (user?.email) {
  sendEmail(user.email);
}

// 错误
const userName = user && user.name ? user.name : 'Unknown';
```

---

## 3. React规范

### 3.1 组件定义

- 使用函数组件和Hooks
- 组件名称使用 **PascalCase**
- 组件文件名使用 **PascalCase**

```typescript
// 正确 - UserProfile.tsx
import React from 'react';

interface UserProfileProps {
  userId: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  return <div>User ID: {userId}</div>;
};

export default UserProfile;
```

### 3.2 组件结构

组件按以下顺序组织：

1. 导入语句
2. 类型定义
3. 组件定义
4. 辅助函数
5. 导出

```typescript
// 1. 导入语句
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';

// 2. 类型定义
interface UserCardProps {
  user: User;
}

// 3. 组件定义
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 副作用
  }, []);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <Button onClick={handleClick}>
        {isExpanded ? '收起' : '展开'}
      </Button>
    </div>
  );
};

// 5. 导出
export default UserCard;
```

### 3.3 Hooks使用

- Hooks必须在组件顶层调用
- 自定义Hook使用 `use` 前缀
- 依赖数组必须完整

```typescript
// 正确
const useUserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []); // 依赖数组

  return users;
};

// 错误
const UserList = () => {
  if (condition) {
    const [users, setUsers] = useState<User[]>([]); // 不在顶层
  }
};
```

### 3.4 条件渲染

- 使用短路求值进行简单条件渲染
- 使用三元运算符进行条件选择

```typescript
// 正确
const UserStatus = ({ isActive }: { isActive: boolean }) => (
  <div>
    {isActive && <span>活跃</span>}
    {!isActive && <span>未激活</span>}
  </div>
);

const UserBadge = ({ role }: { role: string }) => (
  <span className={role === 'admin' ? 'badge-admin' : 'badge-user'}>
    {role === 'admin' ? '管理员' : '用户'}
  </span>
);
```

### 3.5 列表渲染

- 必须提供唯一的 `key` 属性
- 避免使用索引作为key

```typescript
// 正确
const UserList = ({ users }: { users: User[] }) => (
  <ul>
    {users.map((user) => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);

// 错误
const UserList = ({ users }: { users: User[] }) => (
  <ul>
    {users.map((user, index) => (
      <li key={index}>{user.name}</li> // 使用索引作为key
    ))}
  </ul>
);
```

---

## 4. 后端规范

### 4.1 模块结构

NestJS模块按以下结构组织：

```
module/
├── dto/                  # 数据传输对象
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/             # 实体定义
│   └── user.entity.ts
├── module.ts            # 模块定义
├── controller.ts        # 控制器
├── service.ts           # 服务
└── module.spec.ts       # 测试文件
```

### 4.2 控制器规范

- 使用装饰器定义路由
- 使用DTO进行请求验证
- 返回标准响应格式

```typescript
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
```

### 4.3 服务规范

- 使用依赖注入
- 方法职责单一
- 处理异常情况

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('用户已存在');
    }

    return this.prisma.user.create({
      data: createUserDto,
    });
  }
}
```

### 4.4 DTO规范

- 使用 `class-validator` 进行验证
- 使用 `class-transformer` 进行转换
- 使用Swagger装饰器

```typescript
export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

---

## 5. 命名约定

### 5.1 变量命名

- 使用 **camelCase**
- 布尔值使用 `is`, `has`, `should` 前缀
- 集合类型使用复数形式

```typescript
// 正确
const userName = 'John';
const isActive = true;
const hasPermission = false;
const users = [];
const gameList = [];

// 错误
const UserName = 'John';
const active = true;
const user = [];
```

### 5.2 常量命名

- 使用 **UPPER_SNAKE_CASE**
- 使用 `const` 声明

```typescript
// 正确
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 10;

// 错误
const maxRetryCount = 3;
const apiBaseUrl = 'https://api.example.com';
```

### 5.3 函数命名

- 使用 **camelCase**
- 使用动词开头
- 名称应描述函数功能

```typescript
// 正确
const fetchUserById = (id: number) => { };
const calculateTotalPrice = (items: CartItem[]) => { };
const validateEmail = (email: string) => { };

// 错误
const user = (id: number) => { };
const price = (items: CartItem[]) => { };
```

### 5.4 类和接口命名

- 使用 **PascalCase**
- 类名使用名词
- 接口名使用名词或形容词

```typescript
// 正确
class UserService { }
class GameRepository { }
interface Serializable { }
interface UserRepository { }

// 错误
class userService { }
class game_repository { }
interface ISerializable { }
```

### 5.5 文件命名

- 组件文件：**PascalCase** (如 `UserProfile.tsx`)
- 工具文件：**camelCase** (如 `apiClient.ts`)
- 样式文件：**camelCase** (如 `userProfile.css`)
- 配置文件：**kebab-case** (如 `vite.config.ts`)

---

## 6. 注释规范

### 6.1 文件注释

每个文件开头添加文件注释：

```typescript
/**
 * 用户服务模块
 * 提供用户相关的业务逻辑处理
 * 
 * @module UserService
 * @author 云幕开发团队
 * @version 1.0.0
 */
```

### 6.2 函数注释

使用JSDoc格式注释函数：

```typescript
/**
 * 根据ID获取用户信息
 * 
 * @param userId - 用户ID
 * @returns 用户信息对象
 * @throws {NotFoundException} 用户不存在时抛出异常
 * 
 * @example
 * const user = await getUserById(1);
 */
const getUserById = async (userId: number): Promise<User> => {
  // 实现
};
```

### 6.3 行内注释

- 使用 `//` 进行单行注释
- 注释与代码之间保留一个空格
- 注释应解释"为什么"而不是"是什么"

```typescript
// 正确
const retryCount = 3; // 最大重试次数，避免无限重试

// 错误
const retryCount = 3; // 设置重试次数为3
```

### 6.4 TODO注释

使用标准TODO格式：

```typescript
// TODO: 实现用户权限验证
// FIXME: 修复并发访问问题
// HACK: 临时解决方案，需要优化
// NOTE: 重要说明
```

---

## 7. 代码审查标准

### 7.1 代码质量

- [ ] 代码符合编码规范
- [ ] 无TypeScript编译错误
- [ ] 无ESLint警告
- [ ] 无console.log等调试代码
- [ ] 无未使用的导入和变量

### 7.2 功能实现

- [ ] 功能符合需求描述
- [ ] 边界条件处理正确
- [ ] 错误处理完善
- [ ] 性能考虑充分

### 7.3 测试覆盖

- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 关键路径有测试覆盖
- [ ] 测试用例有意义

### 7.4 文档更新

- [ ] API文档已更新
- [ ] README已更新（如有必要）
- [ ] 注释清晰完整

### 7.5 安全检查

- [ ] 无SQL注入风险
- [ ] 无XSS攻击风险
- [ ] 敏感数据已加密
- [ ] 权限验证正确

---

## 相关文档

- [Git工作流程](./03-git-workflow.md)
- [测试指南](./04-testing-guide.md)
- [API接口规范](../api/01-api-specification.md)

---

## 联系方式

- **技术支持**: tech@cloudcurtain.com
- **开发团队**: dev@cloudcurtain.com

---

**文档维护团队**: 云幕开发团队  
**最后更新**: 2026-03-14
