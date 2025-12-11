// 游戏服务 - Swagger 配置
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger 配置选项
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '游戏服务 API 文档',
      version: '1.0.0',
      description: '木鱼游戏平台 - 游戏服务 API 文档',
      contact: {
        name: '木鱼游戏团队',
        email: 'developer@muyu-game.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3002}`,
        description: '开发环境',
      },
      {
        url: 'https://api.muyu-game.com/game-service',
        description: '生产环境',
      },
    ],
    components: {
      schemas: {
        // 游戏模型
        Game: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '游戏ID',
              example: 1,
            },
            developer_id: {
              type: 'integer',
              description: '开发者ID',
              example: 1,
            },
            title: {
              type: 'string',
              description: '游戏标题',
              example: '王者荣耀',
            },
            description: {
              type: 'string',
              description: '游戏描述',
              example: '一款多人在线战术竞技游戏',
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: '游戏价格',
              example: 0.00,
            },
            discount_price: {
              type: 'number',
              format: 'decimal',
              description: '折扣价格',
              example: 0.00,
            },
            release_date: {
              type: 'string',
              format: 'date-time',
              description: '发布日期',
              example: '2025-12-01T00:00:00.000Z',
            },
            rating: {
              type: 'number',
              format: 'decimal',
              description: '游戏评分',
              example: 4.8,
            },
            review_count: {
              type: 'integer',
              description: '评论数量',
              example: 10000,
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: '游戏状态',
              example: 'approved',
            },
            main_image_url: {
              type: 'string',
              description: '主图URL',
              example: 'https://example.com/game1-main.jpg',
            },
            cover_image: {
              type: 'string',
              description: '封面图URL',
              example: 'https://example.com/game1-cover.jpg',
            },
            latest_version: {
              type: 'string',
              description: '最新版本',
              example: '1.0.0',
            },
            download_url: {
              type: 'string',
              description: '下载URL',
              example: 'https://example.com/game1-download.exe',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2025-12-01T00:00:00.000Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2025-12-01T00:00:00.000Z',
            },
            categories: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/GameCategory',
              },
              description: '游戏分类',
            },
            tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/GameTag',
              },
              description: '游戏标签',
            },
          },
        },
        // 游戏分类模型
        GameCategory: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '分类ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: '分类名称',
              example: 'MOBA',
            },
            description: {
              type: 'string',
              description: '分类描述',
              example: '多人在线战术竞技游戏',
            },
          },
        },
        // 游戏标签模型
        GameTag: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '标签ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: '标签名称',
              example: '多人',
            },
          },
        },
        // 分页结果模型
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: '当前页码',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: '每页数量',
              example: 10,
            },
            total: {
              type: 'integer',
              description: '总数量',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              description: '总页数',
              example: 10,
            },
          },
        },
        // 成功响应模型
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '请求是否成功',
              example: true,
            },
            data: {
              type: 'object',
              description: '响应数据',
            },
            message: {
              type: 'string',
              description: '响应消息',
              example: '操作成功',
            },
          },
        },
        // 错误响应模型
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '请求是否成功',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: '错误代码',
                  example: 'INTERNAL_SERVER_ERROR',
                },
                message: {
                  type: 'string',
                  description: '错误消息',
                  example: '服务器内部错误',
                },
                details: {
                  type: 'string',
                  description: '错误详情',
                  example: '数据库连接失败',
                },
              },
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 认证令牌',
        },
      },
    },
  },
  // API 文档路径
  apis: ['./controllers/*.js', './routes/*.js', './server.js'],
};

// 初始化 Swagger
const swaggerDocs = swaggerJSDoc(swaggerOptions);

// 导出 Swagger 中间件
const setupSwagger = (app) => {
  // Swagger UI 配置
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      docExpansion: 'none',
    },
    customCss: `.swagger-ui .topbar { display: none }`,
    customSiteTitle: '游戏服务 API 文档',
  }));

  // Swagger JSON 端点
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });

  return app;
};

export default setupSwagger;
