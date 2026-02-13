# 游戏平台数据库设计

## 1. 数据库表结构

### 1.1 用户表 (users)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 用户ID |
| `username` | `VARCHAR(50)` | `UNIQUE NOT NULL` | 用户名 |
| `email` | `VARCHAR(100)` | `UNIQUE NOT NULL` | 邮箱 |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | 哈希后的密码 |
| `avatar` | `VARCHAR(255)` | | 头像URL |
| `bio` | `TEXT` | | 个人简介 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

### 1.2 游戏表 (games)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 游戏ID |
| `title` | `VARCHAR(100)` | `NOT NULL` | 游戏标题 |
| `description` | `TEXT` | `NOT NULL` | 游戏描述 |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | 游戏价格 |
| `release_date` | `DATE` | | 发布日期 |
| `developer` | `VARCHAR(100)` | `NOT NULL` | 开发者 |
| `publisher` | `VARCHAR(100)` | `NOT NULL` | 发行商 |
| `cover_image` | `VARCHAR(255)` | `NOT NULL` | 封面图片URL |
| `trailer_url` | `VARCHAR(255)` | | 预告片URL |
| `system_requirements` | `JSONB` | | 系统要求 |
| `average_rating` | `DECIMAL(3,2)` | `DEFAULT 0` | 平均评分 |
| `review_count` | `INTEGER` | `DEFAULT 0` | 评论数量 |
| `download_count` | `INTEGER` | `DEFAULT 0` | 下载数量 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

### 1.3 游戏分类表 (categories)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 分类ID |
| `name` | `VARCHAR(50)` | `UNIQUE NOT NULL` | 分类名称 |
| `slug` | `VARCHAR(50)` | `UNIQUE NOT NULL` | 分类别名 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

### 1.4 游戏分类关联表 (game_categories)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `game_id` | `INTEGER` | `REFERENCES games(id) ON DELETE CASCADE` | 游戏ID |
| `category_id` | `INTEGER` | `REFERENCES categories(id) ON DELETE CASCADE` | 分类ID |
| `PRIMARY KEY` | | `(game_id, category_id)` | 联合主键 |

### 1.5 评论表 (reviews)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 评论ID |
| `user_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | 用户ID |
| `game_id` | `INTEGER` | `REFERENCES games(id) ON DELETE CASCADE` | 游戏ID |
| `rating` | `INTEGER` | `NOT NULL CHECK (rating BETWEEN 1 AND 5)` | 评分 |
| `content` | `TEXT` | `NOT NULL` | 评论内容 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

### 1.6 订单表 (orders)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 订单ID |
| `user_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | 用户ID |
| `total_amount` | `DECIMAL(10,2)` | `NOT NULL` | 订单总额 |
| `payment_status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'pending'` | 支付状态 |
| `payment_method` | `VARCHAR(50)` | | 支付方式 |
| `transaction_id` | `VARCHAR(100)` | | 交易ID |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

### 1.7 订单项目表 (order_items)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 订单项目ID |
| `order_id` | `INTEGER` | `REFERENCES orders(id) ON DELETE CASCADE` | 订单ID |
| `game_id` | `INTEGER` | `REFERENCES games(id) ON DELETE CASCADE` | 游戏ID |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | 游戏价格 |
| `quantity` | `INTEGER` | `NOT NULL DEFAULT 1` | 数量 |

### 1.8 下载记录表 (downloads)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 下载记录ID |
| `user_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | 用户ID |
| `game_id` | `INTEGER` | `REFERENCES games(id) ON DELETE CASCADE` | 游戏ID |
| `download_date` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 下载日期 |
| `ip_address` | `VARCHAR(50)` | | IP地址 |

### 1.9 通知表 (notifications)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 通知ID |
| `user_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | 用户ID |
| `type` | `VARCHAR(50)` | `NOT NULL` | 通知类型 |
| `message` | `TEXT` | `NOT NULL` | 通知消息 |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` | 是否已读 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

### 1.10 好友关系表 (friendships)
| 字段名 | 数据类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | 好友关系ID |
| `requester_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | 请求方ID |
| `addressee_id` | `INTEGER` | `REFERENCES users(id) ON DELETE CASCADE` | 接收方ID |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'pending'` | 状态 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 更新时间 |

## 2. API接口设计

### 2.1 用户认证接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | 用户注册 | `{"username": "...", "email": "...", "password": "..."}` | `{"id": 1, "username": "...", "email": "...", "token": "..."}` |
| `POST` | `/api/auth/login` | 用户登录 | `{"email": "...", "password": "..."}` | `{"id": 1, "username": "...", "email": "...", "token": "..."}` |
| `GET` | `/api/auth/me` | 获取当前用户信息 | N/A | `{"id": 1, "username": "...", "email": "..."}` |
| `PUT` | `/api/auth/update` | 更新用户信息 | `{"username": "...", "bio": "..."}` | `{"id": 1, "username": "...", "bio": "..."}` |
| `PUT` | `/api/auth/change-password` | 修改密码 | `{"oldPassword": "...", "newPassword": "..."}` | `{"message": "Password changed successfully"}` |

### 2.2 游戏接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/games` | 获取游戏列表 | N/A | `[{"id": 1, "title": "...", "price": 9.99, "cover_image": "..."}]` |
| `GET` | `/api/games/:id` | 获取游戏详情 | N/A | `{"id": 1, "title": "...", "description": "...", "price": 9.99}` |
| `GET` | `/api/games/category/:category` | 按分类获取游戏 | N/A | `[{"id": 1, "title": "...", "price": 9.99}]` |
| `GET` | `/api/games/search` | 搜索游戏 | N/A | `[{"id": 1, "title": "...", "price": 9.99}]` |
| `POST` | `/api/games` | 创建游戏（管理员） | `{"title": "...", "description": "...", "price": 9.99}` | `{"id": 1, "title": "...", "price": 9.99}` |
| `PUT` | `/api/games/:id` | 更新游戏（管理员） | `{"title": "...", "description": "...", "price": 19.99}` | `{"id": 1, "title": "...", "price": 19.99}` |
| `DELETE` | `/api/games/:id` | 删除游戏（管理员） | N/A | `{"message": "Game deleted successfully"}` |

### 2.3 评论接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/games/:gameId/reviews` | 获取游戏评论 | N/A | `[{"id": 1, "user": {"username": "..."}, "rating": 5, "content": "..."}]` |
| `POST` | `/api/games/:gameId/reviews` | 发表评论 | `{"rating": 5, "content": "..."}` | `{"id": 1, "rating": 5, "content": "..."}` |
| `PUT` | `/api/reviews/:id` | 更新评论 | `{"rating": 4, "content": "..."}` | `{"id": 1, "rating": 4, "content": "..."}` |
| `DELETE` | `/api/reviews/:id` | 删除评论 | N/A | `{"message": "Review deleted successfully"}` |

### 2.4 订单接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | 获取用户订单 | N/A | `[{"id": 1, "total_amount": 19.98, "payment_status": "completed"}]` |
| `POST` | `/api/orders` | 创建订单 | `{"items": [{"game_id": 1, "quantity": 1}]}` | `{"id": 1, "total_amount": 9.99, "payment_status": "pending"}` |
| `GET` | `/api/orders/:id` | 获取订单详情 | N/A | `{"id": 1, "total_amount": 9.99, "items": [{"game": {"title": "..."}, "price": 9.99}]}` |
| `PUT` | `/api/orders/:id/pay` | 支付订单 | `{"payment_method": "credit_card", "transaction_id": "..."}` | `{"id": 1, "payment_status": "completed"}` |

### 2.5 下载接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/games/:id/download` | 下载游戏 | N/A | `{"download_url": "...", "expires_at": "..."}` |
| `GET` | `/api/users/downloads` | 获取用户下载记录 | N/A | `[{"game": {"title": "..."}, "download_date": "..."}]` |

### 2.6 通知接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | 获取用户通知 | N/A | `[{"id": 1, "type": "order", "message": "...", "is_read": false}]` |
| `PUT` | `/api/notifications/:id/read` | 标记通知为已读 | N/A | `{"id": 1, "is_read": true}` |
| `DELETE` | `/api/notifications/:id` | 删除通知 | N/A | `{"message": "Notification deleted successfully"}` |

### 2.7 社交接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:id/friends` | 获取用户好友 | N/A | `[{"id": 2, "username": "..."}]` |
| `POST` | `/api/users/:id/friends` | 发送好友请求 | N/A | `{"id": 1, "status": "pending"}` |
| `PUT` | `/api/friendships/:id/accept` | 接受好友请求 | N/A | `{"id": 1, "status": "accepted"}` |
| `PUT` | `/api/friendships/:id/reject` | 拒绝好友请求 | N/A | `{"id": 1, "status": "rejected"}` |
| `DELETE` | `/api/friendships/:id` | 删除好友 | N/A | `{"message": "Friendship deleted successfully"}` |

### 2.8 分类接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | 获取所有分类 | N/A | `[{"id": 1, "name": "Action", "slug": "action"}]` |
| `POST` | `/api/categories` | 创建分类（管理员） | `{"name": "Adventure", "slug": "adventure"}` | `{"id": 2, "name": "Adventure", "slug": "adventure"}` |
| `PUT` | `/api/categories/:id` | 更新分类（管理员） | `{"name": "Action RPG", "slug": "action-rpg"}` | `{"id": 1, "name": "Action RPG", "slug": "action-rpg"}` |
| `DELETE` | `/api/categories/:id` | 删除分类（管理员） | N/A | `{"message": "Category deleted successfully"}` |

## 3. 数据统计接口
| 方法 | 路径 | 描述 | 请求体 (JSON) | 成功响应 (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/stats/games` | 获取游戏统计 | N/A | `{"total_games": 100, "total_downloads": 5000, "total_reviews": 2000}` |
| `GET` | `/api/stats/users` | 获取用户统计 | N/A | `{"total_users": 1000, "new_users_today": 10, "active_users_this_week": 500}` |
| `GET` | `/api/stats/sales` | 获取销售统计 | N/A | `{"total_sales": 50000, "sales_today": 500, "top_selling_games": [{"id": 1, "title": "...", "sales": 1000}]}` |