import swaggerJSDoc from 'swagger-jsdoc';

// Swagger配置选项
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: '木鱼游戏平台 API 文档',
      description: '木鱼游戏平台的后端API文档，包含游戏管理、用户管理、支付、下载等功能',
      version: '1.0.0',
      contact: {
        name: '木鱼游戏团队',
        email: 'contact@muyugame.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: '开发环境',
      },
      {
        url: 'https://api.muyugame.com/api/v1',
        description: '生产环境',
      },
    ],
    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '使用JWT令牌进行身份验证',
        },
      },
      schemas: {
        Game: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '游戏ID',
            },
            title: {
              type: 'string',
              description: '游戏标题',
            },
            description: {
              type: 'string',
              description: '游戏描述',
            },
            price: {
              type: 'number',
              description: '游戏价格',
            },
            discount_price: {
              type: 'number',
              description: '游戏折扣价格',
            },
            release_date: {
              type: 'string',
              format: 'date-time',
              description: '游戏发布日期',
            },
            rating: {
              type: 'number',
              description: '游戏评分',
            },
            main_image_url: {
              type: 'string',
              description: '游戏主图URL',
            },
            developer_id: {
              type: 'integer',
              description: '开发者ID',
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
          required: ['title', 'description', 'price', 'release_date', 'main_image_url', 'developer_id'],
        },
        GameCategory: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '分类ID',
            },
            name: {
              type: 'string',
              description: '分类名称',
            },
            description: {
              type: 'string',
              description: '分类描述',
            },
          },
          required: ['name'],
        },
        GameTag: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '标签ID',
            },
            name: {
              type: 'string',
              description: '标签名称',
            },
          },
          required: ['name'],
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '用户ID',
            },
            username: {
              type: 'string',
              description: '用户名',
            },
            email: {
              type: 'string',
              format: 'email',
              description: '用户邮箱',
            },
            role: {
              type: 'string',
              description: '用户角色',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
          },
          required: ['username', 'email', 'password'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: '用户邮箱',
            },
            password: {
              type: 'string',
              description: '用户密码',
            },
          },
          required: ['email', 'password'],
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '请求是否成功',
            },
            message: {
              type: 'string',
              description: '响应消息',
            },
            data: {
              type: 'object',
              description: '响应数据',
            },
            error: {
              type: 'string',
              description: '错误信息',
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: '资源未找到',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse',
              },
            },
          },
        },
        Unauthorized: {
          description: '未授权访问',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse',
              },
            },
          },
        },
        BadRequest: {
          description: '请求参数错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse',
              },
            },
          },
        },
        InternalServerError: {
          description: '服务器内部错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse',
              },
            },
          },
        },
      },
    },
    security: [
      {
        jwt: [],
      },
    ],
  },
  // 指定要扫描的文件
  apis: ['./routes/*.js', './controllers/**/*.js'],
};

// 初始化swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
