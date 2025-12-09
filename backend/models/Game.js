import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义Game模型
const Game = sequelize.define('Game', {
  // 游戏标题
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '游戏标题不能为空',
      },
    },
  },
  // 游戏描述
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '游戏描述不能为空',
      },
    },
  },
  // 价格
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: '价格必须是一个有效的数字',
      },
      min: {
        args: [0],
        msg: '价格不能为负数',
      },
    },
  },
  // 折扣价格
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      isDecimal: {
        msg: '折扣价格必须是一个有效的数字',
      },
      min: {
        args: [0],
        msg: '折扣价格不能为负数',
      },
      // 折扣价格必须小于原价
      customValidator(value) {
        if (value !== null && value >= this.price) {
          throw new Error('折扣价格必须小于原价');
        }
      },
    },
  },
  // 发布日期
  release_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // 评分
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '评分不能低于0',
      },
      max: {
        args: [5],
        msg: '评分不能高于5',
      },
    },
  },
  // 评论数量
  review_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '评论数量不能为负数',
      },
    },
  },
  // 游戏状态
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  // 主图URL
  main_image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '游戏主图是必填项',
      },
    },
  },
  // 游戏封面图
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // 可执行文件路径
  executable_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // 游戏启动参数
  launch_parameters: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // 最新版本
  latest_version: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  // 下载URL
  download_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // 开发者ID，与Developer模型关联
  developer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 模型配置
  tableName: 'games',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    // 标题索引，用于搜索
    { fields: ['title'], name: 'idx_games_title' },
    // 开发者ID索引
    { fields: ['developer_id'], name: 'idx_games_developer_id' },
    // 状态索引
    { fields: ['status'], name: 'idx_games_status' },
    // 评分索引，用于排序
    { fields: ['rating'], name: 'idx_games_rating' },
    // 价格索引，用于筛选
    { fields: ['price'], name: 'idx_games_price' },
  ],
});

// 定义模型之间的关联
Game.associate = (models) => {
  // 游戏与开发者的多对一关联
  Game.belongsTo(models.Developer, {
    foreignKey: 'developer_id',
    as: 'developer',
    onDelete: 'CASCADE',
  });

  // 游戏与分类的多对多关联
  Game.belongsToMany(models.GameCategory, {
    through: 'game_category_relations',
    foreignKey: 'game_id',
    as: 'categories',
  });

  // 游戏与标签的多对多关联
  Game.belongsToMany(models.GameTag, {
    through: 'game_tag_relations',
    foreignKey: 'game_id',
    as: 'tags',
  });

  // 游戏与版本的一对多关联
  Game.hasMany(models.GameVersion, {
    foreignKey: 'game_id',
    as: 'versions',
    onDelete: 'CASCADE',
  });

  // 游戏与系统需求的一对多关联
  Game.hasMany(models.GameSystemRequirement, {
    foreignKey: 'game_id',
    as: 'system_requirements',
    onDelete: 'CASCADE',
  });

  // 游戏与游戏库的一对多关联
  Game.hasMany(models.GameLibrary, {
    foreignKey: 'game_id',
    as: 'library_entries',
    onDelete: 'CASCADE',
  });

  // 游戏与评价的一对多关联
  Game.hasMany(models.Review, {
    foreignKey: 'game_id',
    as: 'reviews',
    onDelete: 'CASCADE',
  });

  // 游戏与订单商品的一对多关联
  Game.hasMany(models.OrderItem, {
    foreignKey: 'game_id',
    as: 'order_items',
    onDelete: 'CASCADE',
  });
};

export default Game;
