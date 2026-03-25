# API接口规范文档

## 文档概述

本文档详细定义了云幕游戏商店平台的RESTful API接口规范，包括接口设计原则、请求响应格式、错误处理、认证授权等。

**文档版本**: v1.0  
**最后更新**: 2024-03-14  
**API基础URL**: https://api.yunmu.com/v1

---

## 目录

1. [接口设计原则](#1-接口设计原则)
2. [通用规范](#2-通用规范)
3. [认证授权](#3-认证授权)
4. [用户接口](#4-用户接口)
5. [游戏接口](#5-游戏接口)
6. [订单接口](#6-订单接口)
7. [支付接口](#7-支付接口)
8. [社区接口](#8-社区接口)
9. [搜索接口](#9-搜索接口)
10. [通知接口](#10-通知接口)
11. [错误处理](#11-错误处理)
12. [接口限流](#12-接口限流)

---

## 1. 接口设计原则

### 1.1 RESTful设计

- 使用HTTP动词表示操作类型
- 使用名词表示资源
- 支持资源嵌套
- 统一的响应格式

### 1.2 HTTP动词使用

| 动词 | 用途 | 示例 |
|------|------|------|
| GET | 获取资源 | GET /api/v1/users |
| POST | 创建资源 | POST /api/v1/users |
| PUT | 完整更新资源 | PUT /api/v1/users/123 |
| PATCH | 部分更新资源 | PATCH /api/v1/users/123 |
| DELETE | 删除资源 | DELETE /api/v1/users/123 |

### 1.3 资源命名规范

- 使用复数名词
- 使用小写字母
- 使用连字符分隔单词
- 避免动词

**示例**:
```
✓ /api/v1/users
✓ /api/v1/games
✓ /api/v1/orders
✗ /api/v1/getUsers
✗ /api/v1/createUser
```

---

## 2. 通用规范

### 2.1 请求格式

#### 2.1.1 请求头

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
User-Agent: YunmuClient/1.0
X-Request-ID: {uuid}
X-Client-Version: 1.0.0
```

#### 2.1.2 请求参数

**查询参数**:
```
GET /api/v1/games?page=1&limit=20&sort=created_at&order=desc
```

**请求体**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2.2 响应格式

#### 2.2.1 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "username": "testuser",
    "email": "test@example.com"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  },
  "timestamp": 1710412800000
}
```

#### 2.2.2 错误响应

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": 1710412800000
}
```

### 2.3 分页规范

#### 2.3.1 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | integer | 否 | 1 | 页码 |
| limit | integer | 否 | 20 | 每页数量 |
| sort | string | 否 | created_at | 排序字段 |
| order | string | 否 | desc | 排序方向 (asc/desc) |

#### 2.3.2 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "游戏1"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": 1710412800000
}
```

### 2.4 过滤和搜索

#### 2.4.1 过滤参数

```
GET /api/v1/games?category=action&price_min=0&price_max=100
```

#### 2.4.2 搜索参数

```
GET /api/v1/games/search?q=星际探索&tags=科幻,冒险
```

---

## 3. 认证授权

### 3.1 JWT认证

#### 3.1.1 获取Token

**请求**:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "timestamp": 1710412800000
}
```

#### 3.1.2 使用Token

```http
GET /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3.1.3 刷新Token

**请求**:
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3.2 OAuth 2.0

#### 3.2.1 第三方登录

**请求**:
```http
GET /api/v1/auth/oauth/google?redirect_uri=https://app.yunmu.com/callback
```

**响应**:
```http
HTTP/1.1 302 Found
Location: https://accounts.google.com/o/oauth2/v2/auth?client_id=...
```

#### 3.2.2 回调处理

**请求**:
```http
GET /api/v1/auth/oauth/callback?code=4/0AX4XfWh...
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "username": "testuser",
      "email": "test@example.com"
    }
  },
  "timestamp": 1710412800000
}
```

---

## 4. 用户接口

### 4.1 用户注册

**接口**: `POST /api/v1/users/register`

**请求参数**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**响应**:
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 123,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-03-14T10:00:00Z"
  },
  "timestamp": 1710412800000
}
```

### 4.2 用户登录

**接口**: `POST /api/v1/users/login`

**请求参数**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "username": "testuser",
      "email": "test@example.com",
      "avatar": "https://cdn.yunmu.com/avatars/123.jpg"
    }
  },
  "timestamp": 1710412800000
}
```

### 4.3 获取用户信息

**接口**: `GET /api/v1/users/profile`

**认证**: 需要认证

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "https://cdn.yunmu.com/avatars/123.jpg",
    "level": 5,
    "exp": 1250,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-03-14T10:00:00Z"
  },
  "timestamp": 1710412800000
}
```

### 4.4 更新用户信息

**接口**: `PUT /api/v1/users/profile`

**认证**: 需要认证

**请求参数**:
```json
{
  "username": "newusername",
  "avatar": "https://cdn.yunmu.com/avatars/new.jpg"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 123,
    "username": "newusername",
    "email": "test@example.com",
    "avatar": "https://cdn.yunmu.com/avatars/new.jpg"
  },
  "timestamp": 1710412800000
}
```

### 4.5 修改密码

**接口**: `POST /api/v1/users/password`

**认证**: 需要认证

**请求参数**:
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "密码修改成功",
  "timestamp": 1710412800000
}
```

---

## 5. 游戏接口

### 5.1 获取游戏列表

**接口**: `GET /api/v1/games`

**请求参数**:
```
?page=1&limit=20&category=action&sort=rating&order=desc
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "星际探索者",
      "description": "探索宇宙的冒险游戏",
      "category": "action",
      "price": 128,
      "discount": 0.8,
      "finalPrice": 102.4,
      "rating": 4.8,
      "reviewCount": 1250,
      "releaseDate": "2024-01-15",
      "developer": "GameStudio",
      "publisher": "GamePublisher",
      "coverImage": "https://cdn.yunmu.com/games/1/cover.jpg",
      "screenshots": [
        "https://cdn.yunmu.com/games/1/screenshot1.jpg",
        "https://cdn.yunmu.com/games/1/screenshot2.jpg"
      ],
      "tags": ["科幻", "冒险", "开放世界"],
      "isOwned": false,
      "isWishlisted": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": 1710412800000
}
```

### 5.2 获取游戏详情

**接口**: `GET /api/v1/games/:id`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "星际探索者",
    "description": "探索宇宙的冒险游戏",
    "longDescription": "详细的游戏介绍...",
    "category": "action",
    "price": 128,
    "discount": 0.8,
    "finalPrice": 102.4,
    "rating": 4.8,
    "reviewCount": 1250,
    "releaseDate": "2024-01-15",
    "developer": "GameStudio",
    "publisher": "GamePublisher",
    "coverImage": "https://cdn.yunmu.com/games/1/cover.jpg",
    "screenshots": [
      "https://cdn.yunmu.com/games/1/screenshot1.jpg",
      "https://cdn.yunmu.com/games/1/screenshot2.jpg"
    ],
    "videos": [
      {
        "url": "https://cdn.yunmu.com/games/1/trailer.mp4",
        "thumbnail": "https://cdn.yunmu.com/games/1/trailer.jpg"
      }
    ],
    "tags": ["科幻", "冒险", "开放世界"],
    "systemRequirements": {
      "minimum": {
        "os": "Windows 10",
        "processor": "Intel Core i5",
        "memory": "8 GB RAM",
        "graphics": "NVIDIA GTX 1060",
        "storage": "50 GB"
      },
      "recommended": {
        "os": "Windows 11",
        "processor": "Intel Core i7",
        "memory": "16 GB RAM",
        "graphics": "NVIDIA RTX 3060",
        "storage": "50 GB SSD"
      }
    },
    "isOwned": false,
    "isWishlisted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-03-14T10:00:00Z"
  },
  "timestamp": 1710412800000
}
```

### 5.3 搜索游戏

**接口**: `GET /api/v1/games/search`

**请求参数**:
```
?q=星际探索&category=action&tags=科幻,冒险&price_min=0&price_max=200
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "星际探索者",
      "description": "探索宇宙的冒险游戏",
      "category": "action",
      "price": 128,
      "rating": 4.8,
      "coverImage": "https://cdn.yunmu.com/games/1/cover.jpg"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 20
  },
  "timestamp": 1710412800000
}
```

### 5.4 获取游戏分类

**接口**: `GET /api/v1/games/categories`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "动作",
      "slug": "action",
      "gameCount": 1250,
      "icon": "https://cdn.yunmu.com/categories/action.png"
    },
    {
      "id": 2,
      "name": "角色扮演",
      "slug": "rpg",
      "gameCount": 980,
      "icon": "https://cdn.yunmu.com/categories/rpg.png"
    }
  ],
  "timestamp": 1710412800000
}
```

### 5.5 添加到愿望单

**接口**: `POST /api/v1/games/:id/wishlist`

**认证**: 需要认证

**响应**:
```json
{
  "code": 200,
  "message": "已添加到愿望单",
  "timestamp": 1710412800000
}
```

### 5.6 从愿望单移除

**接口**: `DELETE /api/v1/games/:id/wishlist`

**认证**: 需要认证

**响应**:
```json
{
  "code": 200,
  "message": "已从愿望单移除",
  "timestamp": 1710412800000
}
```

---

## 6. 订单接口

### 6.1 创建订单

**接口**: `POST /api/v1/orders`

**认证**: 需要认证

**请求参数**:
```json
{
  "items": [
    {
      "gameId": 1,
      "quantity": 1
    }
  ],
  "couponCode": "SAVE20"
}
```

**响应**:
```json
{
  "code": 201,
  "message": "订单创建成功",
  "data": {
    "id": "ORD20240314001",
    "userId": 123,
    "items": [
      {
        "gameId": 1,
        "gameName": "星际探索者",
        "quantity": 1,
        "price": 128,
        "discount": 0.8,
        "finalPrice": 102.4
      }
    ],
    "subtotal": 128,
    "discount": 25.6,
    "total": 102.4,
    "currency": "CNY",
    "status": "pending",
    "createdAt": "2024-03-14T10:00:00Z",
    "expiresAt": "2024-03-14T10:30:00Z"
  },
  "timestamp": 1710412800000
}
```

### 6.2 获取订单列表

**接口**: `GET /api/v1/orders`

**认证**: 需要认证

**请求参数**:
```
?page=1&limit=20&status=paid
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "ORD20240314001",
      "items": [
        {
          "gameId": 1,
          "gameName": "星际探索者",
          "coverImage": "https://cdn.yunmu.com/games/1/cover.jpg"
        }
      ],
      "total": 102.4,
      "currency": "CNY",
      "status": "paid",
      "createdAt": "2024-03-14T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  },
  "timestamp": 1710412800000
}
```

### 6.3 获取订单详情

**接口**: `GET /api/v1/orders/:id`

**认证**: 需要认证

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "ORD20240314001",
    "userId": 123,
    "items": [
      {
        "gameId": 1,
        "gameName": "星际探索者",
        "quantity": 1,
        "price": 128,
        "discount": 0.8,
        "finalPrice": 102.4,
        "coverImage": "https://cdn.yunmu.com/games/1/cover.jpg"
      }
    ],
    "subtotal": 128,
    "discount": 25.6,
    "total": 102.4,
    "currency": "CNY",
    "status": "paid",
    "paymentMethod": "alipay",
    "paymentId": "PAY20240314001",
    "createdAt": "2024-03-14T10:00:00Z",
    "paidAt": "2024-03-14T10:05:00Z"
  },
  "timestamp": 1710412800000
}
```

### 6.4 取消订单

**接口**: `POST /api/v1/orders/:id/cancel`

**认证**: 需要认证

**请求参数**:
```json
{
  "reason": "不想要了"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "订单已取消",
  "timestamp": 1710412800000
}
```

---

## 7. 支付接口

### 7.1 创建支付

**接口**: `POST /api/v1/payments/create`

**认证**: 需要认证

**请求参数**:
```json
{
  "orderId": "ORD20240314001",
  "paymentMethod": "alipay",
  "returnUrl": "https://app.yunmu.com/payment/return",
  "cancelUrl": "https://app.yunmu.com/payment/cancel"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "支付创建成功",
  "data": {
    "paymentId": "PAY20240314001",
    "paymentUrl": "https://openapi.alipay.com/gateway.do?...",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?...",
    "expiresAt": "2024-03-14T10:30:00Z"
  },
  "timestamp": 1710412800000
}
```

### 7.2 支付回调

**接口**: `POST /api/v1/payments/callback`

**请求参数**:
```json
{
  "paymentId": "PAY20240314001",
  "status": "success",
  "transactionId": "2024031422000000000000000000",
  "paidAt": "2024-03-14T10:05:00Z",
  "signature": "..."
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "timestamp": 1710412800000
}
```

### 7.3 查询支付状态

**接口**: `GET /api/v1/payments/:id/status`

**认证**: 需要认证

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "paymentId": "PAY20240314001",
    "orderId": "ORD20240314001",
    "status": "success",
    "amount": 102.4,
    "currency": "CNY",
    "paymentMethod": "alipay",
    "transactionId": "2024031422000000000000000000",
    "createdAt": "2024-03-14T10:00:00Z",
    "paidAt": "2024-03-14T10:05:00Z"
  },
  "timestamp": 1710412800000
}
```

### 7.4 申请退款

**接口**: `POST /api/v1/payments/:id/refund`

**认证**: 需要认证

**请求参数**:
```json
{
  "reason": "游戏质量问题",
  "amount": 102.4
}
```

**响应**:
```json
{
  "code": 200,
  "message": "退款申请已提交",
  "data": {
    "refundId": "REF20240314001",
    "status": "processing",
    "amount": 102.4,
    "estimatedRefundDate": "2024-03-21T00:00:00Z"
  },
  "timestamp": 1710412800000
}
```

---

## 8. 社区接口

### 8.1 获取游戏评论

**接口**: `GET /api/v1/games/:id/reviews`

**请求参数**:
```
?page=1&limit=20&sort=rating&order=desc
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "username": "testuser",
      "avatar": "https://cdn.yunmu.com/avatars/123.jpg",
      "rating": 5,
      "title": "非常棒的游戏",
      "content": "游戏画面精美，玩法有趣...",
      "helpfulCount": 45,
      "isHelpful": false,
      "createdAt": "2024-03-10T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "averageRating": 4.8
  },
  "timestamp": 1710412800000
}
```

### 8.2 添加评论

**接口**: `POST /api/v1/games/:id/reviews`

**认证**: 需要认证

**请求参数**:
```json
{
  "rating": 5,
  "title": "非常棒的游戏",
  "content": "游戏画面精美，玩法有趣..."
}
```

**响应**:
```json
{
  "code": 201,
  "message": "评论发布成功",
  "data": {
    "id": 1,
    "userId": 123,
    "username": "testuser",
    "rating": 5,
    "title": "非常棒的游戏",
    "content": "游戏画面精美，玩法有趣...",
    "createdAt": "2024-03-14T10:00:00Z"
  },
  "timestamp": 1710412800000
}
```

### 8.3 点赞评论

**接口**: `POST /api/v1/reviews/:id/helpful`

**认证**: 需要认证

**响应**:
```json
{
  "code": 200,
  "message": "点赞成功",
  "timestamp": 1710412800000
}
```

---

## 9. 搜索接口

### 9.1 全局搜索

**接口**: `GET /api/v1/search`

**请求参数**:
```
?q=星际探索&type=all&page=1&limit=20
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "games": [
      {
        "id": 1,
        "name": "星际探索者",
        "type": "game",
        "coverImage": "https://cdn.yunmu.com/games/1/cover.jpg"
      }
    ],
    "users": [
      {
        "id": 123,
        "username": "星际探索者",
        "type": "user",
        "avatar": "https://cdn.yunmu.com/avatars/123.jpg"
      }
    ]
  },
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 20
  },
  "timestamp": 1710412800000
}
```

### 9.2 获取搜索建议

**接口**: `GET /api/v1/search/suggest`

**请求参数**:
```
?q=星际
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "星际探索者",
    "星际争霸",
    "星际迷航"
  ],
  "timestamp": 1710412800000
}
```

---

## 10. 通知接口

### 10.1 获取通知列表

**接口**: `GET /api/v1/notifications`

**认证**: 需要认证

**请求参数**:
```
?page=1&limit=20&type=all&unread=true
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "type": "order",
      "title": "订单支付成功",
      "content": "您的订单 ORD20240314001 已支付成功",
      "isRead": false,
      "createdAt": "2024-03-14T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "unreadCount": 3
  },
  "timestamp": 1710412800000
}
```

### 10.2 标记通知已读

**接口**: `POST /api/v1/notifications/:id/read`

**认证**: 需要认证

**响应**:
```json
{
  "code": 200,
  "message": "标记成功",
  "timestamp": 1710412800000
}
```

---

## 11. 错误处理

### 11.1 HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

### 11.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| 1001 | 用户名已存在 |
| 1002 | 邮箱已存在 |
| 1003 | 用户名或密码错误 |
| 2001 | 游戏不存在 |
| 2002 | 游戏已下架 |
| 3001 | 订单不存在 |
| 3002 | 订单状态错误 |
| 4001 | 支付失败 |
| 4002 | 退款失败 |

### 11.3 错误响应示例

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    },
    {
      "field": "password",
      "message": "密码长度不能少于6位"
    }
  ],
  "timestamp": 1710412800000
}
```

---

## 12. 接口限流

### 12.1 限流策略

| 接口类型 | 限制 | 时间窗口 |
|---------|------|---------|
| 未认证用户 | 100次/分钟 | 1分钟 |
| 已认证用户 | 1000次/分钟 | 1分钟 |
| 登录接口 | 5次/分钟 | 1分钟 |
| 注册接口 | 3次/分钟 | 1分钟 |
| 搜索接口 | 30次/分钟 | 1分钟 |

### 12.2 限流响应

**响应头**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1710412860000
```

**响应体**:
```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后再试",
  "data": {
    "retryAfter": 60
  },
  "timestamp": 1710412800000
}
```

---

## 附录

### A. 数据类型定义

#### User
```typescript
interface User {
  id: number
  username: string
  email: string
  avatar?: string
  level: number
  exp: number
  createdAt: string
  lastLoginAt: string
}
```

#### Game
```typescript
interface Game {
  id: number
  name: string
  description: string
  category: string
  price: number
  discount: number
  finalPrice: number
  rating: number
  reviewCount: number
  releaseDate: string
  developer: string
  publisher: string
  coverImage: string
  screenshots: string[]
  tags: string[]
  isOwned: boolean
  isWishlisted: boolean
}
```

#### Order
```typescript
interface Order {
  id: string
  userId: number
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  currency: string
  status: string
  createdAt: string
  paidAt?: string
}
```

### B. 状态枚举

#### 订单状态
```typescript
enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}
```

#### 支付状态
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

---

**文档结束**