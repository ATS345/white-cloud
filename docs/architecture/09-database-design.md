# 云幕游戏商店平台 - 数据库设计文档

## 文档概述

本文档详细描述了云幕游戏商店平台的数据库设计，包括数据模型、表结构、字段定义、关系设计、索引策略和数据迁移方案。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**设计团队**: 云幕技术团队

---

## 目录

1. [数据库技术选型](#1-数据库技术选型)
2. [数据模型设计](#2-数据模型设计)
3. [关系型数据库设计](#3-关系型数据库设计)
4. [非关系型数据库设计](#4-非关系型数据库设计)
5. [缓存设计](#5-缓存设计)
6. [索引策略](#6-索引策略)
7. [数据迁移方案](#7-数据迁移方案)
8. [数据安全设计](#8-数据安全设计)

---

## 1. 数据库技术选型

### 1.1 数据库选择

| 数据库类型 | 技术 | 版本 | 用途 | 选型理由 |
|-----------|------|------|------|----------|
| 关系型数据库 | PostgreSQL | 16+ | 核心业务数据 | 强大的事务支持，适合结构化数据，开源稳定 |
| 文档数据库 | MongoDB | 7.0+ | 非结构化数据 | 灵活的数据模型，适合存储游戏详情、评论等 |
| 内存数据库 | Redis | 7.0+ | 缓存和会话 | 高性能，适合热点数据和会话管理 |
| 搜索引擎 | Elasticsearch | 8.11+ | 全文搜索 | 强大的搜索能力，适合游戏搜索和推荐 |

### 1.2 存储方案

| 存储类型 | 技术 | 用途 | 选型理由 |
|---------|------|------|----------|
| 对象存储 | AWS S3/阿里云OSS | 游戏文件、图片、视频 | 高可靠性，无限存储，CDN集成 |
| 文件存储 | NAS/SAN | 配置文件、日志 | 高性能，易于管理 |

---

## 2. 数据模型设计

### 2.1 核心实体

| 实体 | 描述 | 存储类型 | 关系 |
|------|------|----------|------|
| **用户 (User)** | 平台用户 | PostgreSQL | 1:N (订单、评论、游戏库) |
| **游戏 (Game)** | 游戏信息 | PostgreSQL | 1:N (分类、标签、评论) |
| **分类 (Category)** | 游戏分类 | PostgreSQL | N:1 (游戏) |
| **标签 (Tag)** | 游戏标签 | PostgreSQL | N:N (游戏) |
| **订单 (Order)** | 订单信息 | PostgreSQL | N:1 (用户、游戏) |
| **支付 (Payment)** | 支付记录 | PostgreSQL | 1:1 (订单) |
| **评论 (Comment)** | 用户评论 | MongoDB | N:1 (用户、游戏) |
| **游戏详情 (GameDetail)** | 游戏详细信息 | MongoDB | 1:1 (游戏) |
| **用户行为 (UserAction)** | 用户行为日志 | MongoDB | N:1 (用户) |
| **游戏库 (GameLibrary)** | 用户拥有的游戏 | PostgreSQL | N:1 (用户、游戏) |
| **愿望单 (Wishlist)** | 用户愿望游戏 | PostgreSQL | N:1 (用户、游戏) |

---

## 3. 关系型数据库设计

### 3.1 用户相关表

#### 3.1.1 `users` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 用户ID |
| `username` | `VARCHAR(50)` | `UNIQUE NOT NULL` | 用户名 |
| `email` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 邮箱 |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | 密码哈希 |
| `display_name` | `VARCHAR(100)` | `NOT NULL` | 显示名称 |
| `avatar` | `VARCHAR(255)` | | 头像URL |
| `bio` | `TEXT` | | 个人简介 |
| `location` | `VARCHAR(100)` | | 所在地 |
| `website` | `VARCHAR(255)` | | 个人网站 |
| `role` | `VARCHAR(20)` | `DEFAULT 'user'` | 角色 (user, admin, developer) |
| `status` | `VARCHAR(20)` | `DEFAULT 'active'` | 状态 (active, inactive, banned) |
| `email_verified` | `BOOLEAN` | `DEFAULT FALSE` | 邮箱是否验证 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |
| `last_login_at` | `TIMESTAMP` | | 最后登录时间 |

#### 3.1.2 `user_sessions` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 会话ID |
| `user_id` | `INTEGER` | `REFERENCES users(id)` | 用户ID |
| `session_token` | `VARCHAR(255)` | `UNIQUE NOT NULL` | 会话令牌 |
| `ip_address` | `VARCHAR(50)` | | IP地址 |
| `user_agent` | `TEXT` | | 用户代理 |
| `expires_at` | `TIMESTAMP` | `NOT NULL` | 过期时间 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

### 3.2 游戏相关表

#### 3.2.1 `games` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 游戏ID |
| `title` | `VARCHAR(255)` | `NOT NULL` | 游戏标题 |
| `slug` | `VARCHAR(255)` | `UNIQUE NOT NULL` | 游戏别名 (用于URL) |
| `description` | `TEXT` | `NOT NULL` | 游戏描述 |
| `developer` | `VARCHAR(255)` | `NOT NULL` | 开发商 |
| `publisher` | `VARCHAR(255)` | `NOT NULL` | 发行商 |
| `release_date` | `DATE` | | 发布日期 |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | 价格 |
| `discount` | `INTEGER` | `DEFAULT 0` | 折扣百分比 |
| `currency` | `VARCHAR(10)` | `DEFAULT 'CNY'` | 货币类型 |
| `average_rating` | `DECIMAL(3,2)` | `DEFAULT 0` | 平均评分 |
| `rating_count` | `INTEGER` | `DEFAULT 0` | 评分数量 |
| `sales_count` | `INTEGER` | `DEFAULT 0` | 销售数量 |
| `status` | `VARCHAR(20)` | `DEFAULT 'active'` | 状态 (active, inactive, coming_soon) |
| `cover_image` | `VARCHAR(255)` | `NOT NULL` | 封面图片URL |
| `header_image` | `VARCHAR(255)` | | 头部图片URL |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

#### 3.2.2 `categories` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 分类ID |
| `name` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 分类名称 |
| `slug` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 分类别名 |
| `description` | `TEXT` | | 分类描述 |
| `icon` | `VARCHAR(255)` | | 分类图标 |
| `order` | `INTEGER` | `DEFAULT 0` | 排序权重 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

#### 3.2.3 `tags` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 标签ID |
| `name` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 标签名称 |
| `slug` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 标签别名 |
| `color` | `VARCHAR(20)` | `DEFAULT '#667eea'` | 标签颜色 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

#### 3.2.4 `game_categories` 表 (多对多关系)

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 关联ID |
| `game_id` | `INTEGER` | `REFERENCES games(id)` | 游戏ID |
| `category_id` | `INTEGER` | `REFERENCES categories(id)` | 分类ID |

#### 3.2.5 `game_tags` 表 (多对多关系)

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 关联ID |
| `game_id` | `INTEGER` | `REFERENCES games(id)` | 游戏ID |
| `tag_id` | `INTEGER` | `REFERENCES tags(id)` | 标签ID |

### 3.3 订单相关表

#### 3.3.1 `orders` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 订单ID |
| `user_id` | `INTEGER` | `REFERENCES users(id)` | 用户ID |
| `order_number` | `VARCHAR(50)` | `UNIQUE NOT NULL` | 订单号 |
| `total_amount` | `DECIMAL(10,2)` | `NOT NULL` | 总金额 |
| `currency` | `VARCHAR(10)` | `DEFAULT 'CNY'` | 货币类型 |
| `status` | `VARCHAR(20)` | `DEFAULT 'pending'` | 状态 (pending, paid, failed, refunded) |
| `payment_method` | `VARCHAR(50)` | | 支付方式 |
| `payment_transaction_id` | `VARCHAR(255)` | | 支付交易ID |
| `billing_address` | `TEXT` | |  billing地址 |
| `shipping_address` | `TEXT` | |  shipping地址 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |
| `paid_at` | `TIMESTAMP` | | 支付时间 |
| `refunded_at` | `TIMESTAMP` | | 退款时间 |

#### 3.3.2 `order_items` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 订单项ID |
| `order_id` | `INTEGER` | `REFERENCES orders(id)` | 订单ID |
| `game_id` | `INTEGER` | `REFERENCES games(id)` | 游戏ID |
| `quantity` | `INTEGER` | `DEFAULT 1` | 数量 |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | 单价 |
| `discount` | `INTEGER` | `DEFAULT 0` | 折扣百分比 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

#### 3.3.3 `payments` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 支付ID |
| `order_id` | `INTEGER` | `REFERENCES orders(id)` | 订单ID |
| `transaction_id` | `VARCHAR(255)` | `UNIQUE NOT NULL` | 交易ID |
| `amount` | `DECIMAL(10,2)` | `NOT NULL` | 支付金额 |
| `currency` | `VARCHAR(10)` | `DEFAULT 'CNY'` | 货币类型 |
| `payment_method` | `VARCHAR(50)` | `NOT NULL` | 支付方式 |
| `status` | `VARCHAR(20)` | `DEFAULT 'pending'` | 状态 (pending, success, failed) |
| `payload` | `JSONB` | | 支付平台返回数据 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

### 3.4 用户游戏相关表

#### 3.4.1 `game_libraries` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 游戏库ID |
| `user_id` | `INTEGER` | `REFERENCES users(id)` | 用户ID |
| `game_id` | `INTEGER` | `REFERENCES games(id)` | 游戏ID |
| `acquired_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 获得时间 |
| `last_played_at` | `TIMESTAMP` | | 最后游玩时间 |
| `play_time` | `INTEGER` | `DEFAULT 0` | 游玩时间 (分钟) |

#### 3.4.2 `wishlists` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 愿望单ID |
| `user_id` | `INTEGER` | `REFERENCES users(id)` | 用户ID |
| `game_id` | `INTEGER` | `REFERENCES games(id)` | 游戏ID |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 添加时间 |

### 3.5 系统相关表

#### 3.5.1 `permissions` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 权限ID |
| `name` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 权限名称 |
| `code` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 权限代码 |
| `description` | `TEXT` | | 权限描述 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

#### 3.5.2 `roles` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 角色ID |
| `name` | `VARCHAR(50)` | `UNIQUE NOT NULL` | 角色名称 |
| `description` | `TEXT` | | 角色描述 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

#### 3.5.3 `role_permissions` 表 (多对多关系)

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `SERIAL` | `PRIMARY KEY` | 关联ID |
| `role_id` | `INTEGER` | `REFERENCES roles(id)` | 角色ID |
| `permission_id` | `INTEGER` | `REFERENCES permissions(id)` | 权限ID |

---

## 4. 非关系型数据库设计

### 4.1 MongoDB 集合设计

#### 4.1.1 `game_details` 集合

```json
{
  "_id": ObjectId("..."),
  "game_id": 1,
  "description": "游戏详细描述",
  "system_requirements": {
    "minimum": {
      "os": "Windows 10",
      "processor": "Intel Core i5",
      "memory": "4 GB RAM",
      "graphics": "NVIDIA GTX 1050",
      "storage": "50 GB available space"
    },
    "recommended": {
      "os": "Windows 10 64-bit",
      "processor": "Intel Core i7",
      "memory": "8 GB RAM",
      "graphics": "NVIDIA GTX 1070",
      "storage": "50 GB available space"
    }
  },
  "screenshots": [
    "https://example.com/screenshot1.jpg",
    "https://example.com/screenshot2.jpg"
  ],
  "videos": [
    {
      "title": "游戏预告片",
      "url": "https://example.com/trailer.mp4",
      "thumbnail": "https://example.com/trailer.jpg"
    }
  ],
  "developers": ["开发者1", "开发者2"],
  "publishers": ["发行商1"],
  "languages": {
    "interface": ["简体中文", "English"],
    "audio": ["简体中文", "English"],
    "subtitles": ["简体中文", "English", "Japanese"]
  },
  "features": ["多人游戏", "成就", "云存储"],
  "updated_at": ISODate("2026-03-14T00:00:00Z")
}
```

#### 4.1.2 `comments` 集合

```json
{
  "_id": ObjectId("..."),
  "game_id": 1,
  "user_id": 123,
  "username": "用户名",
  "avatar": "https://example.com/avatar.jpg",
  "rating": 4.5,
  "content": "游戏非常好玩！",
  "likes": 10,
  "dislikes": 2,
  "replies": [
    {
      "user_id": 456,
      "username": "回复用户",
      "content": "同意！",
      "created_at": ISODate("2026-03-14T00:00:00Z")
    }
  ],
  "created_at": ISODate("2026-03-14T00:00:00Z"),
  "updated_at": ISODate("2026-03-14T00:00:00Z")
}
```

#### 4.1.3 `user_actions` 集合

```json
{
  "_id": ObjectId("..."),
  "user_id": 123,
  "action_type": "view_game",
  "action_data": {
    "game_id": 1,
    "duration": 300
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": ISODate("2026-03-14T00:00:00Z")
}
```

#### 4.1.4 `recommendations` 集合

```json
{
  "_id": ObjectId("..."),
  "user_id": 123,
  "recommendations": [
    {
      "game_id": 1,
      "score": 0.95,
      "reason": "基于您喜欢的游戏类型"
    },
    {
      "game_id": 2,
      "score": 0.85,
      "reason": "热门游戏"
    }
  ],
  "updated_at": ISODate("2026-03-14T00:00:00Z")
}
```

---

## 5. 缓存设计

### 5.1 Redis 缓存键设计

| 缓存键 | 类型 | 过期时间 | 用途 |
|--------|------|----------|------|
| `user:session:{session_token}` | Hash | 7天 | 用户会话 |
| `user:profile:{user_id}` | Hash | 1小时 | 用户资料 |
| `game:details:{game_id}` | Hash | 1小时 | 游戏详情 |
| `games:hot` | List | 10分钟 | 热门游戏 |
| `games:new` | List | 10分钟 | 新游戏 |
| `games:recommended:{user_id}` | List | 30分钟 | 推荐游戏 |
| `categories:all` | List | 1小时 | 所有分类 |
| `tags:popular` | List | 1小时 | 热门标签 |
| `search:results:{query}` | List | 5分钟 | 搜索结果 |
| `rate_limit:{ip}` | String | 1分钟 | 限流计数 |

### 5.2 缓存策略

#### 5.2.1 缓存更新策略
- **Cache-Aside**: 应用程序先检查缓存，未命中则从数据库获取并更新缓存
- **Write-Through**: 写入数据库的同时更新缓存
- **Cache Invalidation**: 数据变更时主动失效相关缓存

#### 5.2.2 缓存预热
- 系统启动时预热热门游戏、分类等数据
- 定时任务更新缓存数据
- 预测性缓存常用数据

---

## 6. 索引策略

### 6.1 PostgreSQL 索引

| 表名 | 字段 | 索引类型 | 用途 |
|------|------|----------|------|
| `users` | `username` | `UNIQUE INDEX` | 用户名查找 |
| `users` | `email` | `UNIQUE INDEX` | 邮箱查找 |
| `users` | `created_at` | `INDEX` | 时间排序 |
| `games` | `slug` | `UNIQUE INDEX` | URL友好查找 |
| `games` | `title` | `INDEX` | 标题搜索 |
| `games` | `price` | `INDEX` | 价格筛选 |
| `games` | `average_rating` | `INDEX` | 评分排序 |
| `games` | `created_at` | `INDEX` | 时间排序 |
| `orders` | `user_id` | `INDEX` | 用户订单查询 |
| `orders` | `order_number` | `UNIQUE INDEX` | 订单号查找 |
| `orders` | `status` | `INDEX` | 状态筛选 |
| `order_items` | `order_id` | `INDEX` | 订单商品查询 |
| `order_items` | `game_id` | `INDEX` | 游戏订单查询 |
| `game_libraries` | `user_id` | `INDEX` | 用户游戏库查询 |
| `game_libraries` | `game_id` | `INDEX` | 游戏拥有者查询 |
| `wishlists` | `user_id` | `INDEX` | 用户愿望单查询 |
| `wishlists` | `game_id` | `INDEX` | 游戏愿望单查询 |

### 6.2 MongoDB 索引

| 集合 | 字段 | 索引类型 | 用途 |
|------|------|----------|------|
| `game_details` | `game_id` | `UNIQUE INDEX` | 游戏详情查找 |
| `comments` | `game_id` | `INDEX` | 游戏评论查询 |
| `comments` | `user_id` | `INDEX` | 用户评论查询 |
| `comments` | `created_at` | `INDEX` | 时间排序 |
| `user_actions` | `user_id` | `INDEX` | 用户行为查询 |
| `user_actions` | `action_type` | `INDEX` | 行为类型查询 |
| `user_actions` | `created_at` | `INDEX` | 时间排序 |
| `recommendations` | `user_id` | `UNIQUE INDEX` | 用户推荐查询 |

### 6.3 Elasticsearch 索引

#### 6.3.1 `games` 索引

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "integer" },
      "title": { "type": "text", "analyzer": "ik_max_word" },
      "description": { "type": "text", "analyzer": "ik_max_word" },
      "developer": { "type": "keyword" },
      "publisher": { "type": "keyword" },
      "categories": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "price": { "type": "float" },
      "average_rating": { "type": "float" },
      "sales_count": { "type": "integer" },
      "release_date": { "type": "date" },
      "created_at": { "type": "date" }
    }
  }
}
```

---

## 7. 数据迁移方案

### 7.1 数据库初始化

1. **创建数据库**
   - PostgreSQL: `CREATE DATABASE yunmu_game_store;`
   - MongoDB: `use yunmu_game_store`
   - Redis: 配置持久化

2. **创建用户和权限**
   - PostgreSQL: 创建应用用户并授权
   - MongoDB: 创建用户和角色

3. **初始化表结构**
   - 使用 SQL 脚本创建所有表
   - 建立索引和约束

4. **初始化基础数据**
   - 插入默认分类和标签
   - 创建默认角色和权限

### 7.2 数据迁移策略

#### 7.2.1 版本控制
- 使用数据库迁移工具 (如 Flyway、Liquibase)
- 每次变更都有对应的迁移脚本
- 记录迁移历史

#### 7.2.2 迁移流程
1. **开发环境**：直接运行迁移脚本
2. **测试环境**：先备份，再运行迁移
3. **生产环境**：
   - 低峰期执行
   - 先备份数据库
   - 执行迁移脚本
   - 验证数据完整性

### 7.3 数据备份策略

| 备份类型 | 频率 | 保留时间 | 存储位置 |
|---------|------|----------|----------|
| 全量备份 | 每天 | 30天 | 异地存储 |
| 增量备份 | 每小时 | 7天 | 本地存储 |
| 日志备份 | 实时 | 7天 | 本地存储 |

---

## 8. 数据安全设计

### 8.1 数据加密

#### 8.1.1 传输加密
- 所有数据库连接使用 SSL/TLS
- 应用服务器与数据库之间使用加密通道

#### 8.1.2 存储加密
- PostgreSQL: 使用透明数据加密 (TDE)
- MongoDB: 启用加密存储引擎
- 敏感字段加密：
  - 密码：bcrypt 哈希
  - 邮箱：字段级加密
  - 支付信息：第三方支付平台处理

### 8.2 访问控制

#### 8.2.1 数据库用户权限
- 最小权限原则
- 不同服务使用不同数据库用户
- 只读用户用于报表和分析

#### 8.2.2 网络隔离
- 数据库服务器放在私有网络
- 只允许应用服务器访问
- 使用防火墙限制访问

### 8.3 审计日志

- 记录所有数据库操作
- 监控异常访问
- 定期审计日志

### 8.4 数据脱敏

- 开发和测试环境使用脱敏数据
- 敏感信息在日志中脱敏
- API响应中的敏感信息处理

---

## 附录

### A. 数据库连接配置

#### PostgreSQL 连接配置
```
host: localhost
port: 5432
database: yunmu_game_store
user: yunmu_app
password: ********
sslmode: require
```

#### MongoDB 连接配置
```
mongodb://yunmu_app:********@localhost:27017/yunmu_game_store?authSource=admin
```

#### Redis 连接配置
```
host: localhost
port: 6379
password: ********
db: 0
```

### B. 性能优化建议

1. **查询优化**
   - 使用索引覆盖查询
   - 避免全表扫描
   - 合理使用 JOIN

2. **数据库参数调优**
   - PostgreSQL: shared_buffers, work_mem, maintenance_work_mem
   - MongoDB: wiredTiger cache size
   - Redis: maxmemory, maxmemory-policy

3. **连接池配置**
   - 应用层连接池
   - 合理设置连接数

4. **读写分离**
   - 主库处理写操作
   - 从库处理读操作

### C. 监控和维护

1. **监控指标**
   - 数据库连接数
   - 查询响应时间
   - 缓存命中率
   - 存储空间使用

2. **维护任务**
   - 定期 VACUUM (PostgreSQL)
   - 索引重建
   - 数据清理

3. **故障恢复**
   - 定期备份验证
   - 恢复演练
   - 高可用方案

---

**文档结束**

本文档将随着项目进展持续更新和完善。