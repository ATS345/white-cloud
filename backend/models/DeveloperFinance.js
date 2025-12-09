import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// 定义DeveloperFinance模型
const DeveloperFinance = sequelize.define('DeveloperFinance', {
  // 财务周期开始日期
  period_start: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '财务周期开始日期不能为空',
      },
    },
  },
  // 财务周期结束日期
  period_end: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '财务周期结束日期不能为空',
      },
    },
  },
  // 总销售额
  total_sales: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '总销售额不能为负数',
      },
    },
  },
  // 平台分成
  platform_fee: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '平台分成不能为负数',
      },
    },
  },
  // 开发者收益
  developer_earnings: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: '开发者收益不能为负数',
      },
    },
  },
  // 财务状态
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'paid'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'processed', 'paid']],
        msg: '财务状态必须是pending、processed或paid',
      },
    },
  },
  // 开发者ID，与Developer模型关联
  developer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 模型配置
  tableName: 'developer_finances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// 定义模型之间的关联
DeveloperFinance.associate = (models) => {
  // 财务记录与开发者的多对一关联
  DeveloperFinance.belongsTo(models.Developer, {
    foreignKey: 'developer_id',
    as: 'developer',
    onDelete: 'CASCADE',
  });
};

export default DeveloperFinance;
