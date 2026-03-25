# 云幕游戏商店平台 - API接口规范文档

## 文档概述

本文档提供了云幕游戏商店平台的详细API接口规范，包括各个服务模块的API接口定义、请求参数、响应格式、认证方式和错误处理等内容。通过这些规范，确保前后端开发团队能够统一接口标准，提高开发效率和系统稳定性。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**技术团队**: 云幕技术团队

---

## 目录

1. [API架构](#1-api架构)
2. [认证方式](#2-认证方式)
3. [响应格式](#3-响应格式)
4. [错误处理](#4-错误处理)
5. [用户服务API](#5-用户服务api)
6. [游戏服务API](#6-游戏服务api)
7. [订单服务API](#7-订单服务api)
8. [支付服务API](#8-支付服务api)
9. [内容服务API](#9-内容服务api)
10. [社区服务API](#10-社区服务api)
11. [搜索服务API](#11-搜索服务api)
12. [通知服务API](#12-通知服务api)

---

## 1. API架构

### 1.1 整体架构

云幕游戏商店平台采用微服务架构，API接口通过API网关统一管理和路由。每个服务模块都有独立的API接口，通过API网关暴露给客户端。

### 1.2 基础路径

所有API接口的基础路径为：`https://api.cloudcurtain.com/v1`

### 1.3 服务模块

| 服务模块 | 路径前缀 | 主要功能 |
|----------|----------|----------|
| **用户服务** | `/users` | 用户管理、认证授权 |
| **游戏服务** | `/games` | 游戏管理、目录服务 |
| **订单服务** | `/orders` | 订单管理、交易处理 |
| **支付服务** | `/payments` | 支付集成、退款处理 |
| **内容服务** | `/content` | 内容分发、下载管理 |
| **社区服务** | `/community` | 社区互动、评论评分 |
| **搜索服务** | `/search` | 搜索引擎、推荐算法 |
| **通知服务** | `/notifications` | 消息通知、推送服务 |

---

## 2. 认证方式

### 2.1 JWT认证

云幕游戏商店平台使用JWT（JSON Web Token）进行认证，客户端需要在请求头中携带有效的JWT Token。

**请求头格式**：
```
Authorization: Bearer {token}
```

### 2.2 Token获取

通过登录接口获取JWT Token：
- `POST /users/login`：用户登录，返回JWT Token
- `POST /users/refresh`：刷新Token

### 2.3 权限控制

采用RBAC（基于角色的访问控制）权限模型，不同角色拥有不同的API访问权限。

---

## 3. 响应格式

### 3.1 成功响应

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    // 响应数据
  },
  "timestamp": "2026-03-14T12:00:00Z"
}
```

### 3.2 分页响应

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "list": [
      // 数据列表
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  },
  "timestamp": "2026-03-14T12:00:00Z"
}
```

### 3.3 错误响应

```json
{
  "code": 400,
  "message": "错误信息",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "参数无效"
  },
  "timestamp": "2026-03-14T12:00:00Z"
}
```

---

## 4. 错误处理

### 4.1 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| **200** | 成功 | 200 |
| **400** | 请求参数错误 | 400 |
| **401** | 未授权 | 401 |
| **403** | 禁止访问 | 403 |
| **404** | 资源不存在 | 404 |
| **409** | 资源冲突 | 409 |
| **500** | 服务器内部错误 | 500 |
| **502** | 网关错误 | 502 |
| **503** | 服务不可用 | 503 |
| **504** | 网关超时 | 504 |

### 4.2 错误类型

| 错误类型 | 描述 |
|----------|------|
| **INVALID_PARAMETER** | 参数无效 |
| **AUTHENTICATION_FAILED** | 认证失败 |
| **AUTHORIZATION_FAILED** | 授权失败 |
| **RESOURCE_NOT_FOUND** | 资源不存在 |
| **RESOURCE_CONFLICT** | 资源冲突 |
| **SERVICE_ERROR** | 服务错误 |
| **NETWORK_ERROR** | 网络错误 |
| **RATE_LIMIT_EXCEEDED** | 速率限制超出 |

---

## 5. 用户服务API

### 5.1 认证接口

#### 5.1.1 用户注册

- **路径**：`POST /users/register`
- **描述**：用户注册
- **请求参数**：
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "display_name": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "display_name": "User One",
      "token": "jwt_token"
    }
  }
  ```

#### 5.1.2 用户登录

- **路径**：`POST /users/login`
- **描述**：用户登录
- **请求参数**：
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "display_name": "User One",
      "token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
  ```

#### 5.1.3 刷新Token

- **路径**：`POST /users/refresh`
- **描述**：刷新Token
- **请求参数**：
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "Token刷新成功",
    "data": {
      "token": "new_jwt_token",
      "refresh_token": "new_refresh_token"
    }
  }
  ```

#### 5.1.4 用户登出

- **路径**：`POST /users/logout`
- **描述**：用户登出
- **认证**：需要JWT Token
- **响应**：
  ```json
  {
    "code": 200,
    "message": "登出成功"
  }
  ```

### 5.2 用户管理接口

#### 5.2.1 获取用户信息

- **路径**：`GET /users/me`
- **描述**：获取当前用户信息
- **认证**：需要JWT Token
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "display_name": "User One",
      "avatar": "url",
      "bio": "个人简介",
      "location": "北京",
      "website": "https://example.com",
      "role": "user",
      "status": "active",
      "email_verified": true,
      "created_at": "2026-03-14T12:00:00Z",
      "updated_at": "2026-03-14T12:00:00Z",
      "last_login_at": "2026-03-14T12:00:00Z"
    }
  }
  ```

#### 5.2.2 更新用户信息

- **路径**：`PUT /users/me`
- **描述**：更新当前用户信息
- **认证**：需要JWT Token
- **请求参数**：
  ```json
  {
    "display_name": "string",
    "avatar": "string",
    "bio": "string",
    "location": "string",
    "website": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {
      "id": 1,
      "username": "user1",
      "email": "user1@example.com",
      "display_name": "Updated Name",
      "avatar": "url",
      "bio": "更新后的简介",
      "location": "上海",
      "website": "https://updated.com"
    }
  }
  ```

#### 5.2.3 修改密码

- **路径**：`PUT /users/me/password`
- **描述**：修改密码
- **认证**：需要JWT Token
- **请求参数**：
  ```json
  {
    "old_password": "string",
    "new_password": "string"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "密码修改成功"
  }
  ```

---

## 6. 游戏服务API

### 6.1 游戏列表接口

#### 6.1.1 获取游戏列表

- **路径**：`GET /games`
- **描述**：获取游戏列表
- **查询参数**：
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `sort`: 排序字段，如 `created_at`, `price`, `rating`
  - `order`: 排序方向，`asc` 或 `desc`
  - `genre`: 游戏类型ID
  - `platform`: 平台ID
  - `tag`: 标签ID
  - `price_min`: 最低价格
  - `price_max`: 最高价格
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "list": [
        {
          "id": 1,
          "title": "游戏标题",
          "slug": "game-slug",
          "description": "游戏描述",
          "price": 99.99,
          "currency": "CNY",
          "developer": "开发商",
          "publisher": "发行商",
          "release_date": "2026-03-14",
          "cover_image": "url",
          "average_rating": 4.5,
          "review_count": 100
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "pages": 10
      }
    }
  }
  ```

#### 6.1.2 获取热门游戏

- **路径**：`GET /games/hot`
- **描述**：获取热门游戏
- **查询参数**：
  - `limit`: 数量，默认10
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": [
      {
        "id": 1,
        "title": "游戏标题",
        "slug": "game-slug",
        "cover_image": "url",
        "price": 99.99,
        "average_rating": 4.5
      }
    ]
  }
  ```

#### 6.1.3 获取新品游戏

- **路径**：`GET /games/new`
- **描述**：获取新品游戏
- **查询参数**：
  - `limit`: 数量，默认10
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": [
      {
        "id": 1,
        "title": "游戏标题",
        "slug": "game-slug",
        "cover_image": "url",
        "price": 99.99,
        "release_date": "2026-03-14"
      }
    ]
  }
  ```

### 6.2 游戏详情接口

#### 6.2.1 获取游戏详情

- **路径**：`GET /games/{id}`
- **描述**：获取游戏详情
- **路径参数**：
  - `id`: 游戏ID
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "id": 1,
      "title": "游戏标题",
      "slug": "game-slug",
      "description": "游戏描述",
      "short_description": "短描述",
      "price": 99.99,
      "currency": "CNY",
      "developer": "开发商",
      "publisher": "发行商",
      "release_date": "2026-03-14",
      "status": "published",
      "cover_image": "url",
      "header_image": "url",
      "average_rating": 4.5,
      "review_count": 100,
      "genres": [
        {
          "id": 1,
          "name": "动作"
        }
      ],
      "platforms": [
        {
          "id": 1,
          "name": "PC"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "开放世界"
        }
      ],
      "screenshots": [
        {
          "id": 1,
          "url": "url",
          "thumbnail_url": "url",
          "caption": "截图描述"
        }
      ],
      "videos": [
        {
          "id": 1,
          "url": "url",
          "thumbnail_url": "url",
          "caption": "视频描述"
        }
      ],
      "system_requirements": {
        "minimum": {
          "os": "Windows 10",
          "processor": "Intel i5",
          "memory": "8 GB RAM",
          "graphics": "NVIDIA GTX 1060",
          "storage": "50 GB"
        },
        "recommended": {
          "os": "Windows 10",
          "processor": "Intel i7",
          "memory": "16 GB RAM",
          "graphics": "NVIDIA GTX 2080",
          "storage": "50 GB"
        }
      },
      "features": [
        {
          "name": "多人游戏",
          "description": "支持多人在线"
        }
      ],
      "languages": [
        {
          "name": "简体中文",
          "interface": true,
          "audio": true,
          "subtitles": true
        }
      ],
      "created_at": "2026-03-14T12:00:00Z",
      "updated_at": "2026-03-14T12:00:00Z"
    }
  }
  ```

#### 6.2.2 获取游戏类型

- **路径**：`GET /games/genres`
- **描述**：获取游戏类型列表
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": [
      {
        "id": 1,
        "name": "动作",
        "slug": "action"
      }
    ]
  }
  ```

#### 6.2.3 获取游戏平台

- **路径**：`GET /games/platforms`
- **描述**：获取游戏平台列表
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": [
      {
        "id": 1,
        "name": "PC",
        "slug": "pc"
      }
    ]
  }
  ```

---

## 7. 订单服务API

### 7.1 订单管理接口

#### 7.1.1 创建订单

- **路径**：`POST /orders`
- **描述**：创建订单
- **认证**：需要JWT Token
- **请求参数**：
  ```json
  {
    "items": [
      {
        "game_id": 1,
        "quantity": 1
      }
    ],
    "payment_method": "alipay",
    "shipping_address": "收货地址",
    "billing_address": "账单地址"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "订单创建成功",
    "data": {
      "id": 1,
      "order_number": "ORD202603140001",
      "user_id": 1,
      "total_amount": 99.99,
      "currency": "CNY",
      "status": "pending",
      "payment_method": "alipay",
      "items": [
        {
          "id": 1,
          "game_id": 1,
          "title": "游戏标题",
          "price": 99.99,
          "quantity": 1
        }
      ],
      "created_at": "2026-03-14T12:00:00Z"
    }
  }
  ```

#### 7.1.2 获取订单列表

- **路径**：`GET /orders`
- **描述**：获取用户订单列表
- **认证**：需要JWT Token
- **查询参数**：
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `status`: 订单状态
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "list": [
        {
          "id": 1,
          "order_number": "ORD202603140001",
          "total_amount": 99.99,
          "currency": "CNY",
          "status": "completed",
          "payment_method": "alipay",
          "created_at": "2026-03-14T12:00:00Z",
          "completed_at": "2026-03-14T12:05:00Z"
        }
      ],
      "pagination": {
        "total": 10,
        "page": 1,
        "limit": 10,
        "pages": 1
      }
    }
  }
  ```

#### 7.1.3 获取订单详情

- **路径**：`GET /orders/{id}`
- **描述**：获取订单详情
- **认证**：需要JWT Token
- **路径参数**：
  - `id`: 订单ID
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "id": 1,
      "order_number": "ORD202603140001",
      "user_id": 1,
      "total_amount": 99.99,
      "currency": "CNY",
      "status": "completed",
      "payment_method": "alipay",
      "shipping_address": "收货地址",
      "billing_address": "账单地址",
      "items": [
        {
          "id": 1,
          "game_id": 1,
          "title": "游戏标题",
          "price": 99.99,
          "quantity": 1
        }
      ],
      "payments": [
        {
          "id": 1,
          "transaction_id": "TXN123456",
          "amount": 99.99,
          "status": "completed",
          "created_at": "2026-03-14T12:00:00Z",
          "completed_at": "2026-03-14T12:05:00Z"
        }
      ],
      "created_at": "2026-03-14T12:00:00Z",
      "updated_at": "2026-03-14T12:05:00Z",
      "completed_at": "2026-03-14T12:05:00Z"
    }
  }
  ```

#### 7.1.4 取消订单

- **路径**：`PUT /orders/{id}/cancel`
- **描述**：取消订单
- **认证**：需要JWT Token
- **路径参数**：
  - `id`: 订单ID
- **响应**：
  ```json
  {
    "code": 200,
    "message": "订单取消成功"
  }
  ```

---

## 8. 支付服务API

### 8.1 支付接口

#### 8.1.1 创建支付

- **路径**：`POST /payments`
- **描述**：创建支付
- **认证**：需要JWT Token
- **请求参数**：
  ```json
  {
    "order_id": 1,
    "payment_method": "alipay",
    "amount": 99.99,
    "currency": "CNY"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "支付创建成功",
    "data": {
      "id": 1,
      "order_id": 1,
      "payment_method": "alipay",
      "transaction_id": "TXN123456",
      "amount": 99.99,
      "currency": "CNY",
      "status": "pending",
      "pay_url": "https://pay.example.com/pay?token=xxx"
    }
  }
  ```

#### 8.1.2 支付回调

- **路径**：`POST /payments/callback`
- **描述**：支付回调
- **请求参数**：
  ```json
  {
    "transaction_id": "TXN123456",
    "status": "completed",
    "amount": 99.99,
    "currency": "CNY",
    "payment_method": "alipay",
    "timestamp": "2026-03-14T12:05:00Z",
    "signature": "xxx"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "回调处理成功"
  }
  ```

#### 8.1.3 退款

- **路径**：`POST /payments/{id}/refund`
- **描述**：申请退款
- **认证**：需要JWT Token
- **路径参数**：
  - `id`: 支付ID
- **请求参数**：
  ```json
  {
    "amount": 99.99,
    "reason": "退款原因"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "退款申请成功",
    "data": {
      "refund_id": "REF123456",
      "status": "pending"
    }
  }
  ```

---

## 9. 内容服务API

### 9.1 游戏下载接口

#### 9.1.1 获取游戏下载链接

- **路径**：`GET /content/games/{id}/download`
- **描述**：获取游戏下载链接
- **认证**：需要JWT Token
- **路径参数**：
  - `id`: 游戏ID
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "download_url": "https://download.example.com/game1.exe",
      "expires_at": "2026-03-15T12:00:00Z",
      "size": "50GB",
      "md5": "xxx"
    }
  }
  ```

#### 9.1.2 获取用户游戏库

- **路径**：`GET /content/library`
- **描述**：获取用户游戏库
- **认证**：需要JWT Token
- **查询参数**：
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "list": [
        {
          "id": 1,
          "game_id": 1,
          "title": "游戏标题",
          "cover_image": "url",
          "purchase_date": "2026-03-14T12:00:00Z",
          "last_played": "2026-03-14T12:30:00Z",
          "play_time": 3600
        }
      ],
      "pagination": {
        "total": 10,
        "page": 1,
        "limit": 10,
        "pages": 1
      }
    }
  }
  ```

---

## 10. 社区服务API

### 10.1 评论接口

#### 10.1.1 创建评论

- **路径**：`POST /community/comments`
- **描述**：创建游戏评论
- **认证**：需要JWT Token
- **请求参数**：
  ```json
  {
    "game_id": 1,
    "content": "评论内容",
    "rating": 5
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "评论创建成功",
    "data": {
      "id": 1,
      "user_id": 1,
      "username": "user1",
      "game_id": 1,
      "content": "评论内容",
      "rating": 5,
      "likes": 0,
      "dislikes": 0,
      "created_at": "2026-03-14T12:00:00Z"
    }
  }
  ```

#### 10.1.2 获取游戏评论

- **路径**：`GET /community/games/{id}/comments`
- **描述**：获取游戏评论列表
- **路径参数**：
  - `id`: 游戏ID
- **查询参数**：
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `sort`: 排序字段，如 `created_at`, `likes`
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "list": [
        {
          "id": 1,
          "user_id": 1,
          "username": "user1",
          "avatar": "url",
          "content": "评论内容",
          "rating": 5,
          "likes": 10,
          "dislikes": 0,
          "replies": [
            {
              "id": 1,
              "user_id": 2,
              "username": "user2",
              "content": "回复内容",
              "created_at": "2026-03-14T12:30:00Z"
            }
          ],
          "created_at": "2026-03-14T12:00:00Z"
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "pages": 10
      }
    }
  }
  ```

#### 10.1.3 点赞评论

- **路径**：`POST /community/comments/{id}/like`
- **描述**：点赞评论
- **认证**：需要JWT Token
- **路径参数**：
  - `id`: 评论ID
- **响应**：
  ```json
  {
    "code": 200,
    "message": "点赞成功",
    "data": {
      "likes": 11
    }
  }
  ```

#### 10.1.4 回复评论

- **路径**：`POST /community/comments/{id}/reply`
- **描述**：回复评论
- **认证**：需要JWT Token
- **路径参数**：
  - `id`: 评论ID
- **请求参数**：
  ```json
  {
    "content": "回复内容"
  }
  ```
- **响应**：
  ```json
  {
    "code": 200,
    "message": "回复成功",
    "data": {
      "id": 1,
      "user_id": 1,
      "username": "user1",
      "content": "回复内容",
      "created_at": "2026-03-14T12:30:00Z"
    }
  }
  ```

---

## 11. 搜索服务API

### 11.1 搜索接口

#### 11.1.1 搜索游戏

- **路径**：`GET /search/games`
- **描述**：搜索游戏
- **查询参数**：
  - `q`: 搜索关键词
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "list": [
        {
          "id": 1,
          "title": "游戏标题",
          "slug": "game-slug",
          "cover_image": "url",
          "price": 99.99,
          "average_rating": 4.5,
          "match_score": 0.95
        }
      ],
      "pagination": {
        "total": 10,
        "page": 1,
        "limit": 10,
        "pages": 1
      }
    }
  }
  ```

#### 11.1.2 获取推荐游戏

- **路径**：`GET /search/recommendations`
- **描述**：获取推荐游戏
- **认证**：需要JWT Token
- **查询参数**：
  - `limit`: 数量，默认10
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": [
      {
        "id": 1,
        "title": "游戏标题",
        "slug": "game-slug",
        "cover_image": "url",
        "price": 99.99,
        "average_rating": 4.5
      }
    ]
  }
  ```

---

## 12. 通知服务API

### 12.1 通知接口

#### 12.1.1 获取通知列表

- **路径**：`GET /notifications`
- **描述**：获取用户通知列表
- **认证**：需要JWT Token
- **查询参数**：
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `status`: 通知状态，如 `unread`, `read`
- **响应**：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": {
      "list": [
        {
          "id": 1,
          "type": "order",
          "title": "订单更新",
          "content": "您的订单已完成",
          "status": "unread",
          "created_at": "2026-03-14T12:00:00Z"
        }
      ],
      "pagination": {
        "total": 10,
        "page": 1,
        "limit": 10,
        "pages": 1
      }
    }
  }
  ```

#### 12.1.2 标记通知为已读

- **路径**：`PUT /notifications/{id}/read`
- **描述**：标记通知为已读
- **认证**：需要JWT Token
- **路径参数**：
  - `id`: 通知ID
- **响应**：
  ```json
  {
    "code": 200,
    "message": "标记成功"
  }
  ```

#### 12.1.3 标记所有通知为已读

- **路径**：`PUT /notifications/read-all`
- **描述**：标记所有通知为已读
- **认证**：需要JWT Token
- **响应**：
  ```json
  {
    "code": 200,
    "message": "标记成功"
  }
  ```

---

## 附录

### A. API版本控制

- **版本号**：v1
- **路径格式**：`/v1/{service}/{endpoint}`
- **版本升级策略**：向后兼容，新功能添加到新版本

### B. 速率限制

| 接口类型 | 限制 | 描述 |
|----------|------|------|
| **认证接口** | 5次/分钟 | 防止暴力破解 |
| **普通接口** | 60次/分钟 | 常规API调用 |
| **搜索接口** | 30次/分钟 | 搜索服务限制 |

### C. 缓存策略

| 接口类型 | 缓存时间 | 描述 |
|----------|----------|------|
| **游戏列表** | 30分钟 | 游戏列表数据 |
| **游戏详情** | 1小时 | 游戏详细信息 |
| **热门游戏** | 30分钟 | 热门游戏数据 |
| **搜索结果** | 15分钟 | 搜索结果缓存 |

### D. API测试

- **测试环境**：`https://api.test.cloudcurtain.com/v1`
- **文档工具**：Swagger UI
- **测试工具**：Postman, curl

---

**文档结束**

本文档将随着项目进展持续更新和完善。