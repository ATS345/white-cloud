# 云幕游戏商店平台 - 系统架构图

## 文档概述

本文档提供了云幕游戏商店平台的详细系统架构图，包括整体架构、微服务架构、数据流设计等多个层面的架构设计。通过这些图表，清晰展示了系统各组件之间的关系和数据流向，为技术团队提供了系统架构的可视化参考。

**文档版本**: v1.0  
**最后更新**: 2026-03-14  
**技术团队**: 云幕技术团队

---

## 目录

1. [整体系统架构](#1-整体系统架构)
2. [微服务架构](#2-微服务架构)
3. [数据流程设计](#3-数据流程设计)
4. [前端架构](#4-前端架构)
5. [后端架构](#5-后端架构)
6. [数据库架构](#6-数据库架构)
7. [基础设施架构](#7-基础设施架构)
8. [安全架构](#8-安全架构)
9. [监控运维架构](#9-监控运维架构)

---

## 1. 整体系统架构

### 1.1 系统架构总览

```mermaid
flowchart TD
    subgraph 客户端层
        A[Web应用] --> B[移动应用]
        B --> C[桌面客户端]
    end

    subgraph CDN层
        D[Cloudflare CDN] --> E[AWS CloudFront]
    end

    subgraph 负载均衡层
        F[Nginx负载均衡] --> G[AWS ELB]
    end

    subgraph API网关层
        H[Kong API网关] --> I[认证授权服务]
    end

    subgraph 应用服务层
        J[用户服务] --> K[游戏服务]
        K --> L[订单服务]
        L --> M[支付服务]
        M --> N[内容服务]
        N --> O[社区服务]
        O --> P[搜索服务]
        P --> Q[通知服务]
    end

    subgraph 消息队列层
        R[RabbitMQ] --> S[Redis Pub/Sub]
    end

    subgraph 数据存储层
        T[PostgreSQL] --> U[MongoDB]
        U --> V[Redis]
        V --> W[Elasticsearch]
        W --> X[S3对象存储]
    end

    subgraph 监控运维层
        Y[Prometheus] --> Z[Grafana]
        Z --> AA[ELK Stack]
        AA --> AB[AlertManager]
    end

    A --> D
    B --> D
    C --> D
    D --> F
    F --> H
    H --> J
    H --> K
    H --> L
    H --> M
    H --> N
    H --> O
    H --> P
    H --> Q
    J --> R
    K --> R
    L --> R
    M --> R
    N --> R
    O --> R
    P --> R
    Q --> R
    R --> S
    J --> T
    K --> T
    L --> T
    M --> T
    N --> U
    O --> U
    P --> W
    Q --> V
    J --> V
    K --> V
    L --> V
    M --> V
    N --> X
    Y --> J
    Y --> K
    Y --> L
    Y --> M
    Y --> N
    Y --> O
    Y --> P
    Y --> Q
    Y --> T
    Y --> U
    Y --> V
    Y --> W
    Y --> X
    Y --> F
    Y --> H
    Y --> R
```

### 1.2 架构层次说明

| 层次 | 组件 | 功能描述 |
|------|------|----------|
| **客户端层** | Web应用、移动应用、桌面客户端 | 用户访问入口，提供界面交互 |
| **CDN层** | Cloudflare CDN、AWS CloudFront | 内容分发网络，加速静态资源和API响应 |
| **负载均衡层** | Nginx负载均衡、AWS ELB | 分发流量，提高系统可用性 |
| **API网关层** | Kong API网关、认证授权服务 | 统一入口，路由转发，认证授权 |
| **应用服务层** | 微服务集群 | 处理核心业务逻辑 |
| **消息队列层** | RabbitMQ、Redis Pub/Sub | 异步通信，解耦服务 |
| **数据存储层** | PostgreSQL、MongoDB、Redis、Elasticsearch、S3 | 存储不同类型的数据 |
| **监控运维层** | Prometheus、Grafana、ELK Stack、AlertManager | 监控系统运行状态，保障系统稳定 |

---

## 2. 微服务架构

### 2.1 微服务组件图

```mermaid
flowchart TD
    subgraph API_Gateway[API网关层]
        API[Kong API网关]
        Auth[认证服务]
    end

    subgraph Core_Services[核心服务]
        User[用户服务]
        Game[游戏服务]
        Order[订单服务]
        Payment[支付服务]
    end

    subgraph Support_Services[支持服务]
        Content[内容服务]
        Community[社区服务]
        Search[搜索服务]
        Notification[通知服务]
    end

    subgraph Data_Stores[数据存储]
        PG[PostgreSQL]
        Mongo[MongoDB]
        Redis[Redis]
        ES[Elasticsearch]
        S3[S3对象存储]
    end

    subgraph Messaging[消息队列]
        Rabbit[RabbitMQ]
    end

    API --> User
    API --> Game
    API --> Order
    API --> Payment
    API --> Content
    API --> Community
    API --> Search
    API --> Notification
    API --> Auth

    User --> PG
    User --> Redis
    Game --> PG
    Game --> Redis
    Order --> PG
    Order --> Redis
    Payment --> PG
    Payment --> Redis
    Content --> Mongo
    Content --> S3
    Community --> Mongo
    Search --> ES
    Notification --> Redis

    User --> Rabbit
    Game --> Rabbit
    Order --> Rabbit
    Payment --> Rabbit
    Content --> Rabbit
    Community --> Rabbit
    Search --> Rabbit
    Notification --> Rabbit

    Rabbit --> User
    Rabbit --> Game
    Rabbit --> Order
    Rabbit --> Payment
    Rabbit --> Content
    Rabbit --> Community
    Rabbit --> Search
    Rabbit --> Notification
```

### 2.2 微服务详细说明

| 服务 | 端口 | 技术栈 | 主要功能 | 依赖服务 |
|------|------|--------|----------|----------|
| **用户服务** | 3001 | NestJS + PostgreSQL | 用户管理、认证授权、个人资料 | PostgreSQL、Redis、RabbitMQ |
| **游戏服务** | 3002 | NestJS + PostgreSQL | 游戏管理、目录服务、游戏详情 | PostgreSQL、Redis、RabbitMQ |
| **订单服务** | 3003 | NestJS + PostgreSQL | 订单管理、交易处理、订单历史 | PostgreSQL、Redis、RabbitMQ |
| **支付服务** | 3004 | NestJS + PostgreSQL | 支付集成、退款处理、支付记录 | PostgreSQL、Redis、RabbitMQ |
| **内容服务** | 3005 | NestJS + MongoDB | 内容分发、下载管理、文件存储 | MongoDB、S3、RabbitMQ |
| **社区服务** | 3006 | NestJS + MongoDB | 社区互动、评论评分、用户生成内容 | MongoDB、RabbitMQ |
| **搜索服务** | 3007 | NestJS + Elasticsearch | 搜索引擎、推荐算法、搜索历史 | Elasticsearch、RabbitMQ |
| **通知服务** | 3008 | NestJS + Redis | 消息通知、推送服务、通知管理 | Redis、RabbitMQ |
| **API网关** | 8000 | Kong + PostgreSQL | API路由、请求转发、认证授权 | PostgreSQL |
| **认证服务** | 3009 | NestJS + Redis | Token管理、认证验证、权限控制 | Redis、RabbitMQ |

---

## 3. 数据流程设计

### 3.1 核心数据流程

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant API as API网关
    participant UserSvc as 用户服务
    participant GameSvc as 游戏服务
    participant OrderSvc as 订单服务
    participant PaymentSvc as 支付服务
    participant ContentSvc as 内容服务
    participant Rabbit as RabbitMQ
    participant PG as PostgreSQL
    participant Mongo as MongoDB
    participant Redis as Redis

    Client->>API: 请求登录
    API->>UserSvc: 转发登录请求
    UserSvc->>PG: 验证用户凭证
    PG-->>UserSvc: 返回用户信息
    UserSvc->>Redis: 生成并存储Token
    UserSvc-->>API: 返回Token和用户信息
    API-->>Client: 返回登录成功响应

    Client->>API: 请求游戏列表
    API->>GameSvc: 转发游戏列表请求
    GameSvc->>Redis: 检查缓存
    alt 缓存命中
        Redis-->>GameSvc: 返回缓存数据
    else 缓存未命中
        GameSvc->>PG: 查询游戏数据
        PG-->>GameSvc: 返回游戏数据
        GameSvc->>Redis: 更新缓存
    end
    GameSvc-->>API: 返回游戏列表
    API-->>Client: 返回游戏列表

    Client->>API: 提交订单
    API->>OrderSvc: 转发订单请求
    OrderSvc->>PG: 创建订单记录
    PG-->>OrderSvc: 确认订单创建
    OrderSvc->>Rabbit: 发布订单创建事件
    OrderSvc-->>API: 返回订单信息
    API-->>Client: 返回订单创建成功

    Rabbit->>PaymentSvc: 消费订单创建事件
    PaymentSvc->>PG: 更新支付状态
    PaymentSvc-->>Client: 发起支付请求
    Client->>PaymentSvc: 完成支付
    PaymentSvc->>PG: 更新支付状态
    PaymentSvc->>Rabbit: 发布支付完成事件

    Rabbit->>OrderSvc: 消费支付完成事件
    OrderSvc->>PG: 更新订单状态
    OrderSvc->>Rabbit: 发布订单完成事件

    Rabbit->>ContentSvc: 消费订单完成事件
    ContentSvc->>Mongo: 更新用户游戏库
    ContentSvc-->>Client: 通知游戏可下载
```

### 3.2 数据流说明

| 流程 | 步骤 | 数据流向 | 说明 |
|------|------|----------|------|
| **用户登录** | 1-8 | 客户端 → API网关 → 用户服务 → PostgreSQL → Redis → API网关 → 客户端 | 验证用户凭证，生成Token |
| **游戏列表查询** | 9-20 | 客户端 → API网关 → 游戏服务 → Redis/PostgreSQL → API网关 → 客户端 | 优先使用缓存，缓存未命中时查询数据库 |
| **订单创建** | 21-28 | 客户端 → API网关 → 订单服务 → PostgreSQL → RabbitMQ → API网关 → 客户端 | 创建订单并发布事件 |
| **支付处理** | 29-35 | RabbitMQ → 支付服务 → PostgreSQL → 客户端 → 支付服务 → PostgreSQL → RabbitMQ | 处理支付并更新状态 |
| **订单完成** | 36-40 | RabbitMQ → 订单服务 → PostgreSQL → RabbitMQ | 更新订单状态并发布完成事件 |
| **游戏交付** | 41-44 | RabbitMQ → 内容服务 → MongoDB → 客户端 | 更新用户游戏库并通知可下载 |

---

## 4. 前端架构

### 4.1 前端组件架构

```mermaid
flowchart TD
    subgraph 客户端应用
        A[Web应用] --> B[移动应用]
        B --> C[桌面客户端]
    end

    subgraph 前端核心
        D[React应用] --> E[TypeScript]
        E --> F[Vite构建工具]
    end

    subgraph 状态管理
        G[Redux Toolkit] --> H[React Query]
        H --> I[本地状态]
    end

    subgraph UI组件
        J[Ant Design] --> K[自定义组件]
        K --> L[布局组件]
    end

    subgraph 路由管理
        M[React Router] --> N[路由守卫]
    end

    subgraph 数据服务
        O[Axios] --> P[API拦截器]
        P --> Q[错误处理]
    end

    A --> D
    B --> D
    C --> D
    D --> G
    D --> J
    D --> M
    D --> O
    G --> O
```

### 4.2 前端页面结构

```mermaid
flowchart TD
    subgraph 页面组件
        A[首页] --> B[游戏列表页]
        B --> C[游戏详情页]
        C --> D[购物车页]
        D --> E[订单确认页]
        E --> F[支付页]
        F --> G[订单完成页]
        A --> H[登录页]
        H --> I[注册页]
        A --> J[个人中心]
        J --> K[我的游戏]
        J --> L[我的订单]
        J --> M[个人设置]
        A --> N[社区页]
        N --> O[评论详情页]
        A --> P[搜索结果页]
    end

    subgraph 公共组件
        Q[头部导航] --> R[搜索栏]
        R --> S[用户菜单]
        Q --> T[页脚]
        T --> U[版权信息]
    end

    A --> Q
    B --> Q
    C --> Q
    D --> Q
    E --> Q
    F --> Q
    G --> Q
    H --> Q
    I --> Q
    J --> Q
    K --> Q
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q

    A --> T
    B --> T
    C --> T
    D --> T
    E --> T
    F --> T
    G --> T
    H --> T
    I --> T
    J --> T
    K --> T
    L --> T
    M --> T
    N --> T
    O --> T
    P --> T
```

---

## 5. 后端架构

### 5.1 后端服务架构

```mermaid
flowchart TD
    subgraph 入口层
        A[API网关] --> B[认证授权]
    end

    subgraph 服务层
        C[控制器层] --> D[服务层]
        D --> E[数据访问层]
    end

    subgraph 公共层
        F[守卫] --> G[拦截器]
        G --> H[管道]
        H --> I[过滤器]
    end

    subgraph 配置层
        J[环境变量] --> K[配置文件]
        K --> L[配置中心]
    end

    subgraph 集成层
        M[支付接口] --> N[短信服务]
        N --> O[邮件服务]
        O --> P[CDN服务]
    end

    A --> C
    B --> C
    C --> F
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I
    C --> J
    D --> J
    E --> J
    C --> M
    D --> M
```

### 5.2 后端服务模块

| 模块 | 功能 | 技术实现 |
|------|------|----------|
| **控制器层** | 处理HTTP请求，参数验证，路由管理 | NestJS控制器 |
| **服务层** | 业务逻辑处理，事务管理，服务调用 | NestJS服务 |
| **数据访问层** | 数据库操作，ORM映射，数据转换 | Prisma ORM |
| **守卫** | 认证授权，权限检查，访问控制 | NestJS守卫 |
| **拦截器** | 请求/响应处理，日志记录，性能监控 | NestJS拦截器 |
| **管道** | 数据验证，类型转换，错误处理 | NestJS管道 |
| **过滤器** | 异常处理，错误响应，日志记录 | NestJS过滤器 |
| **配置管理** | 环境变量，配置文件，配置中心 | 环境变量 + 配置文件 |
| **外部集成** | 支付接口，短信服务，邮件服务 | 第三方SDK |

---

## 6. 数据库架构

### 6.1 数据库关系图

```mermaid
flowchart TD
    subgraph 关系型数据库
        A[users] --> B[games]
        B --> C[orders]
        C --> D[order_items]
        A --> C
        A --> E[payments]
        C --> E
        B --> F[game_genres]
        B --> G[game_platforms]
        B --> H[game_tags]
        A --> I[user_roles]
    end

    subgraph 文档型数据库
        J[game_details] --> K[game_screenshots]
        K --> L[game_videos]
        J --> M[comments]
        A --> M
        A --> N[user_profiles]
        N --> O[user_preferences]
    end

    subgraph 缓存数据库
        P[user_sessions] --> Q[game_cache]
        Q --> R[api_cache]
        R --> S[rate_limits]
    end

    subgraph 搜索数据库
        T[game_index] --> U[user_index]
        U --> V[comment_index]
    end

    A --> P
    B --> Q
    C --> Q
    M --> V
    B --> T
    A --> U
```

### 6.2 数据库职责划分

| 数据库 | 类型 | 主要职责 | 存储内容 |
|--------|------|----------|----------|
| **PostgreSQL** | 关系型 | 核心业务数据，事务处理 | 用户、游戏、订单、支付等结构化数据 |
| **MongoDB** | 文档型 | 非结构化数据，灵活存储 | 游戏详情、评论、用户资料等半结构化数据 |
| **Redis** | 缓存型 | 缓存、会话、限流 | 用户会话、API缓存、游戏缓存、速率限制 |
| **Elasticsearch** | 搜索型 | 全文搜索，推荐系统 | 游戏索引、用户索引、评论索引 |
| **S3** | 对象存储 | 大文件存储 | 游戏安装包、截图、视频等静态资源 |

---

## 7. 基础设施架构

### 7.1 基础设施架构图

```mermaid
flowchart TD
    subgraph 云服务
        A[AWS EC2] --> B[AWS S3]
        B --> C[AWS RDS]
        C --> D[AWS ElastiCache]
        D --> E[AWS ELB]
        E --> F[AWS CloudFront]
    end

    subgraph 容器化
        G[Docker] --> H[Kubernetes]
        H --> I[Helm]
    end

    subgraph 网络
        J[Nginx] --> K[Kong API Gateway]
        K --> L[Cloudflare]
    end

    subgraph 安全
        M[WAF] --> N[DDoS防护]
        N --> O[SSL/TLS]
    end

    A --> G
    G --> J
    J --> M
    B --> F
    C --> D
    E --> J
```

### 7.2 基础设施组件

| 组件 | 类型 | 功能 | 技术实现 |
|------|------|------|----------|
| **计算服务** | 云服务 | 虚拟机实例 | AWS EC2 |
| **存储服务** | 云服务 | 对象存储 | AWS S3 |
| **数据库服务** | 云服务 | 托管数据库 | AWS RDS |
| **缓存服务** | 云服务 | 托管Redis | AWS ElastiCache |
| **负载均衡** | 云服务 | 流量分发 | AWS ELB |
| **CDN服务** | 云服务 | 内容分发 | AWS CloudFront |
| **容器管理** | 容器化 | 容器运行时 | Docker |
| **容器编排** | 容器化 | 容器管理 | Kubernetes |
| **应用部署** | 容器化 | 应用包管理 | Helm |
| **Web服务器** | 网络 | 反向代理 | Nginx |
| **API网关** | 网络 | API管理 | Kong |
| **CDN** | 网络 | 内容加速 | Cloudflare |
| **Web应用防火墙** | 安全 | 应用防护 | Cloudflare WAF |
| **DDoS防护** | 安全 | 流量防护 | Cloudflare DDoS |
| **SSL/TLS** | 安全 | 传输加密 | Let's Encrypt |

---

## 8. 安全架构

### 8.1 安全架构图

```mermaid
flowchart TD
    subgraph 外部威胁
        A[DDoS攻击] --> B[SQL注入]
        B --> C[XSS攻击]
        C --> D[CSRF攻击]
        D --> E[中间人攻击]
    end

    subgraph 安全防护层
        F[WAF] --> G[DDoS防护]
        G --> H[SSL/TLS]
        H --> I[API网关认证]
        I --> J[JWT认证]
        J --> K[RBAC授权]
        K --> L[数据加密]
        L --> M[审计日志]
    end

    subgraph 内部防护
        N[网络隔离] --> O[访问控制]
        O --> P[入侵检测]
        P --> Q[漏洞扫描]
        Q --> R[安全监控]
    end

    A --> F
    B --> F
    C --> F
    D --> F
    E --> H
    F --> I
    I --> J
    J --> K
    K --> L
    L --> M
    N --> O
    O --> P
    P --> Q
    Q --> R
```

### 8.2 安全措施

| 安全层面 | 措施 | 技术实现 | 防护目标 |
|----------|------|----------|----------|
| **网络安全** | Web应用防火墙 | Cloudflare WAF | 防止SQL注入、XSS等攻击 |
| **网络安全** | DDoS防护 | Cloudflare DDoS | 防止分布式拒绝服务攻击 |
| **传输安全** | SSL/TLS | Let's Encrypt | 加密传输数据 |
| **认证安全** | JWT认证 | jsonwebtoken | 无状态认证 |
| **认证安全** | OAuth 2.0 | Passport.js | 第三方认证 |
| **授权安全** | RBAC | 自定义权限系统 | 基于角色的访问控制 |
| **数据安全** | 数据加密 | AES-256 | 敏感数据加密存储 |
| **数据安全** | 密码哈希 | bcrypt | 密码安全存储 |
| **操作安全** | 审计日志 | ELK Stack | 记录操作行为 |
| **操作安全** | 入侵检测 | Wazuh | 检测异常行为 |
| **操作安全** | 漏洞扫描 | OWASP ZAP | 发现安全漏洞 |
| **操作安全** | 安全监控 | Prometheus + Grafana | 监控安全事件 |

---

## 9. 监控运维架构

### 9.1 监控运维架构图

```mermaid
flowchart TD
    subgraph 监控数据源
        A[应用日志] --> B[系统指标]
        B --> C[网络流量]
        C --> D[数据库指标]
        D --> E[API调用]
    end

    subgraph 监控工具
        F[Prometheus] --> G[Grafana]
        G --> H[ELK Stack]
        H --> I[AlertManager]
    end

    subgraph 运维工具
        J[Jenkins] --> K[GitHub Actions]
        K --> L[Terraform]
        L --> M[Ansible]
    end

    subgraph 告警通知
        N[邮件] --> O[短信]
        O --> P[Slack]
        P --> Q[企业微信]
    end

    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    F --> G
    F --> H
    F --> I
    I --> N
    I --> O
    I --> P
    I --> Q
    J --> L
    K --> L
    L --> M
```

### 9.2 监控运维组件

| 组件 | 类型 | 功能 | 技术实现 |
|------|------|------|----------|
| **监控系统** | 监控工具 | 指标收集和存储 | Prometheus |
| **可视化工具** | 监控工具 | 指标可视化 | Grafana |
| **日志系统** | 监控工具 | 日志收集和分析 | ELK Stack |
| **告警系统** | 监控工具 | 告警管理和通知 | AlertManager |
| **CI/CD** | 运维工具 | 持续集成和部署 | Jenkins + GitHub Actions |
| **基础设施即代码** | 运维工具 | 基础设施管理 | Terraform |
| **配置管理** | 运维工具 | 配置自动化 | Ansible |
| **告警通知** | 告警通知 | 邮件通知 | SMTP |
| **告警通知** | 告警通知 | 短信通知 | 阿里云短信 |
| **告警通知** | 告警通知 | 即时通讯 | Slack + 企业微信 |

---

## 附录

### A. 架构设计原则

1. **高可用性**：多实例部署，负载均衡，故障自动切换
2. **可扩展性**：水平扩展，服务独立部署，按需扩容
3. **安全性**：多层防护，加密传输，访问控制
4. **性能优化**：缓存策略，CDN加速，数据库优化
5. **可维护性**：模块化设计，代码规范，自动化部署
6. **一致性**：数据一致性，服务一致性，接口一致性
7. **可靠性**：错误处理，重试机制，降级策略
8. **可观测性**：监控系统，日志系统，告警系统

### B. 架构演进规划

1. **第一阶段**：基础架构搭建，核心功能实现
   - 搭建微服务框架
   - 实现核心业务功能
   - 建立监控系统

2. **第二阶段**：性能优化，安全加固
   - 优化数据库查询
   - 实现缓存策略
   - 加强安全防护

3. **第三阶段**：功能扩展，生态建设
   - 增加新功能模块
   - 集成第三方服务
   - 构建开发者生态

4. **第四阶段**：智能化，自动化
   - 引入AI推荐系统
   - 实现自动化运维
   - 优化用户体验

### C. 架构决策记录

| 决策 | 日期 | 决策内容 | 决策理由 |
|------|------|----------|----------|
| 微服务架构 | 2026-03-01 | 采用微服务架构 | 提高系统可扩展性和可维护性 |
| 多数据库策略 | 2026-03-05 | 使用多种数据库 | 针对不同数据类型选择最合适的存储方案 |
| 容器化部署 | 2026-03-10 | 使用Docker和Kubernetes | 提高部署效率和环境一致性 |
| 云服务选择 | 2026-03-12 | 选择AWS作为云服务提供商 | 全球覆盖，服务丰富，可靠性高 |
| 安全架构 | 2026-03-14 | 采用多层安全防护 | 保障系统和数据安全 |

---

**文档结束**

本文档将随着项目进展持续更新和完善。