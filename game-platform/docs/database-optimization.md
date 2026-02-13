# 数据库查询优化方案

## 1. 项目概述

本方案针对游戏商店平台项目的数据库查询进行优化，旨在提高数据库性能，减少查询响应时间，降低数据库负载，确保系统在高并发情况下能够稳定运行。

## 2. 数据库架构

### 2.1 数据库表结构

根据 `database-design.md` 文件，数据库包含以下主要表：

- **users**: 用户表
- **games**: 游戏表
- **categories**: 游戏分类表
- **game_categories**: 游戏分类关联表
- **reviews**: 评论表
- **orders**: 订单表
- **order_items**: 订单项目表
- **downloads**: 下载记录表
- **notifications**: 通知表
- **friendships**: 好友关系表

### 2.2 数据关系

- 用户可以购买多个游戏（订单）
- 游戏可以属于多个分类（多对多）
- 用户可以对游戏发表评论（一对多）
- 用户可以下载游戏（一对多）
- 用户可以有多个通知（一对多）
- 用户之间可以建立好友关系（多对多）

## 3. 索引优化

### 3.1 主键索引

所有表都应该有主键索引，这是数据库自动创建的。

### 3.2 外键索引

外键字段应该创建索引，以提高连接查询的性能：

```sql
-- 用户相关外键索引
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee_id ON friendships(addressee_id);

-- 游戏相关外键索引
CREATE INDEX idx_reviews_game_id ON reviews(game_id);
CREATE INDEX idx_order_items_game_id ON order_items(game_id);
CREATE INDEX idx_downloads_game_id ON downloads(game_id);
CREATE INDEX idx_game_categories_game_id ON game_categories(game_id);

-- 其他外键索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_game_categories_category_id ON game_categories(category_id);
```

### 3.3 常用查询字段索引

对于经常用于查询条件的字段，应该创建索引：

```sql
-- 游戏表索引
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_games_price ON games(price);
CREATE INDEX idx_games_average_rating ON games(average_rating);
CREATE INDEX idx_games_release_date ON games(release_date);

-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 分类表索引
CREATE INDEX idx_categories_slug ON categories(slug);

-- 订单表索引
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 3.4 复合索引

对于经常一起使用的查询条件，应该创建复合索引：

```sql
-- 复合索引示例
CREATE INDEX idx_reviews_game_id_rating ON reviews(game_id, rating);
CREATE INDEX idx_orders_user_id_created_at ON orders(user_id, created_at);
CREATE INDEX idx_games_category_id_price ON game_categories(category_id), games(price);
```

### 3.5 全文搜索索引

对于需要进行全文搜索的字段，应该创建全文搜索索引：

```sql
-- 全文搜索索引
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_games_title_trgm ON games USING gin (title gin_trgm_ops);
CREATE INDEX idx_games_description_trgm ON games USING gin (description gin_trgm_ops);
CREATE INDEX idx_games_developer_trgm ON games USING gin (developer gin_trgm_ops);
```

## 4. 查询语句优化

### 4.1 基本查询优化

1. **选择必要的列**：只查询需要的列，避免使用 `SELECT *`

```sql
-- 优化前
SELECT * FROM games;

-- 优化后
SELECT id, title, price, cover_image, average_rating FROM games;
```

2. **使用 WHERE 子句**：尽量使用 WHERE 子句过滤数据，减少返回的数据量

```sql
-- 优化前
SELECT id, title, price FROM games;

-- 优化后
SELECT id, title, price FROM games WHERE price < 50;
```

3. **避免在 WHERE 子句中使用函数**：函数会阻止索引的使用

```sql
-- 优化前
SELECT id, title FROM games WHERE LOWER(title) LIKE '%cyberpunk%';

-- 优化后
SELECT id, title FROM games WHERE title ILIKE '%cyberpunk%';
```

4. **使用 LIMIT 限制返回行数**：对于分页查询，使用 LIMIT 和 OFFSET

```sql
-- 优化前
SELECT id, title, price FROM games ORDER BY average_rating DESC;

-- 优化后
SELECT id, title, price FROM games ORDER BY average_rating DESC LIMIT 10 OFFSET 20;
```

### 4.2 连接查询优化

1. **使用合适的连接类型**：根据实际情况选择 INNER JOIN、LEFT JOIN 等

2. **小表驱动大表**：将小表作为驱动表，减少连接次数

3. **避免笛卡尔积**：确保连接条件正确，避免产生笛卡尔积

4. **使用子查询优化**：对于复杂查询，使用子查询分解复杂度

```sql
-- 优化前
SELECT g.id, g.title, AVG(r.rating) as average_rating
FROM games g
LEFT JOIN reviews r ON g.id = r.game_id
GROUP BY g.id, g.title
ORDER BY average_rating DESC;

-- 优化后
SELECT g.id, g.title, COALESCE(r.average_rating, 0) as average_rating
FROM games g
LEFT JOIN (
  SELECT game_id, AVG(rating) as average_rating
  FROM reviews
  GROUP BY game_id
) r ON g.id = r.game_id
ORDER BY average_rating DESC;
```

### 4.3 聚合查询优化

1. **使用合适的聚合函数**：根据实际情况选择 SUM、AVG、COUNT 等

2. **使用 GROUP BY 优化**：只按必要的字段分组

3. **使用 HAVING 代替 WHERE**：对于聚合后的过滤，使用 HAVING

4. **避免在 GROUP BY 中使用函数**：函数会增加计算开销

```sql
-- 优化前
SELECT g.id, g.title, COUNT(r.id) as review_count
FROM games g
LEFT JOIN reviews r ON g.id = r.game_id
GROUP BY g.id, g.title
HAVING COUNT(r.id) > 10
ORDER BY review_count DESC;

-- 优化后
SELECT g.id, g.title, COALESCE(r.review_count, 0) as review_count
FROM games g
LEFT JOIN (
  SELECT game_id, COUNT(*) as review_count
  FROM reviews
  GROUP BY game_id
  HAVING COUNT(*) > 10
) r ON g.id = r.game_id
ORDER BY review_count DESC;
```

### 4.4 子查询优化

1. **使用 EXISTS 代替 IN**：对于 EXISTS 子查询，数据库会在找到第一个匹配项后停止搜索

```sql
-- 优化前
SELECT id, title FROM games WHERE id IN (
  SELECT game_id FROM reviews WHERE rating = 5
);

-- 优化后
SELECT id, title FROM games g WHERE EXISTS (
  SELECT 1 FROM reviews r WHERE r.game_id = g.id AND r.rating = 5
);
```

2. **使用 JOIN 代替子查询**：对于某些情况，JOIN 比子查询更高效

```sql
-- 优化前
SELECT id, title FROM games WHERE id NOT IN (
  SELECT game_id FROM orders
);

-- 优化后
SELECT g.id, g.title FROM games g
LEFT JOIN orders o ON g.id = o.game_id
WHERE o.game_id IS NULL;
```

## 5. 数据库配置优化

### 5.1 连接池配置

使用连接池管理数据库连接，减少连接建立和关闭的开销：

```javascript
// Node.js 连接池配置示例
const pool = new Pool({
  user: 'game_platform_user',
  host: 'localhost',
  database: 'game_platform',
  password: 'your_password',
  port: 5432,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间
  connectionTimeoutMillis: 2000, // 连接超时时间
});
```

### 5.2 缓存配置

使用 Redis 等缓存系统缓存热点数据，减少数据库查询：

```javascript
// Redis 缓存示例
const redis = require('redis');
const client = redis.createClient();

// 缓存游戏列表
async function getGames() {
  const cacheKey = 'games:all';
  
  // 尝试从缓存获取
  const cachedData = await client.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  // 从数据库查询
  const games = await pool.query('SELECT * FROM games');
  
  // 缓存结果
  await client.set(cacheKey, JSON.stringify(games.rows), 'EX', 300); // 5分钟过期
  
  return games.rows;
}
```

### 5.3 数据库参数优化

根据服务器配置和业务需求，优化数据库参数：

```conf
# PostgreSQL 配置示例
shared_buffers = 256MB # 共享缓冲区大小
work_mem = 16MB # 工作内存大小
maintenance_work_mem = 128MB # 维护工作内存大小
effective_cache_size = 1GB # 有效缓存大小
random_page_cost = 1.1 # 随机页面访问成本
seq_page_cost = 1.0 # 顺序页面访问成本
```

## 6. 分区表优化

对于大型表，可以使用分区表来提高查询性能：

### 6.1 时间分区

对于时间相关的表，如 `orders`、`downloads`、`notifications` 等，可以按时间分区：

```sql
-- 订单表按年分区
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
PARTITION BY RANGE (EXTRACT(YEAR FROM created_at));

-- 创建分区
CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM (2024) TO (2025);

CREATE TABLE orders_2025 PARTITION OF orders
  FOR VALUES FROM (2025) TO (2026);
```

### 6.2 范围分区

对于数值范围相关的表，如 `games`（按价格）、`reviews`（按评分）等，可以按范围分区：

```sql
-- 游戏表按价格分区
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  release_date DATE,
  developer VARCHAR(100) NOT NULL,
  publisher VARCHAR(100) NOT NULL,
  cover_image VARCHAR(255) NOT NULL,
  trailer_url VARCHAR(255),
  system_requirements JSONB,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
PARTITION BY RANGE (price);

-- 创建分区
CREATE TABLE games_low_price PARTITION OF games
  FOR VALUES FROM (0) TO (20);

CREATE TABLE games_medium_price PARTITION OF games
  FOR VALUES FROM (20) TO (50);

CREATE TABLE games_high_price PARTITION OF games
  FOR VALUES FROM (50) TO (1000);
```

## 7. 查询性能监控

### 7.1 慢查询日志

启用慢查询日志，识别性能问题：

```conf
# PostgreSQL 慢查询日志配置
log_min_duration_statement = 500 # 记录执行时间超过 500ms 的查询
log_statement = 'all' # 记录所有语句
log_directory = 'pg_log' # 日志目录
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log' # 日志文件名
log_rotation_age = 1d # 日志轮换时间
log_rotation_size = 10MB # 日志文件大小
```

### 7.2 执行计划分析

使用 `EXPLAIN ANALYZE` 分析查询执行计划：

```sql
EXPLAIN ANALYZE
SELECT g.id, g.title, g.price, AVG(r.rating) as average_rating
FROM games g
LEFT JOIN reviews r ON g.id = r.game_id
GROUP BY g.id, g.title, g.price
ORDER BY average_rating DESC
LIMIT 10;
```

### 7.3 监控工具

使用以下工具监控数据库性能：

- **pg_stat_statements**: PostgreSQL 内置的语句统计工具
- **pgBadger**: PostgreSQL 日志分析工具
- **Prometheus + Grafana**: 监控数据库指标
- **DataDog**: 数据库性能监控

## 8. 最佳实践

### 8.1 索引使用最佳实践

- **只创建必要的索引**：索引会增加写入开销
- **定期重建索引**：避免索引碎片
- **使用部分索引**：对于特定条件的查询
- **使用覆盖索引**：包含查询所需的所有字段

### 8.2 查询编写最佳实践

- **保持查询简单**：避免过于复杂的查询
- **使用绑定变量**：避免 SQL 注入，提高缓存命中率
- **避免全表扫描**：尽量使用索引
- **合理使用事务**：避免长事务

### 8.3 数据库设计最佳实践

- **规范化设计**：减少数据冗余
- **合理使用数据类型**：选择合适的数据类型
- **使用 JSONB 存储复杂数据**：对于系统要求等复杂数据
- **定期维护数据库**：VACUUM、ANALYZE 等

## 9. 测试计划

### 9.1 性能测试

1. **基准测试**：测试优化前的性能
2. **优化测试**：测试优化后的性能
3. **对比分析**：分析优化效果

### 9.2 测试场景

- **高并发查询**：模拟 1000 个并发用户查询游戏列表
- **复杂查询**：测试包含多个表连接的复杂查询
- **大数据量查询**：测试百万级数据量的查询性能
- **写入性能**：测试高并发写入性能

## 10. 结论

通过本优化方案的实施，预计可以：

- **提高查询性能**：响应时间减少 50% 以上
- **降低数据库负载**：CPU 使用率降低 30% 以上
- **提高系统稳定性**：支持更高的并发访问
- **减少运维成本**：减少数据库服务器资源消耗

本方案为游戏商店平台项目的数据库查询优化提供了全面的指导，可根据实际业务需求和服务器配置进行调整。
