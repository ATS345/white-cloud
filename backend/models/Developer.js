import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义Developer模型
const Developer = sequelize.define('Developer', {
  // 公司名称
  company_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '公司名称不能为空'
      }
    }
  },
  // 联系邮箱
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '联系邮箱不能为空'
      },
      isEmail: {
        msg: '请输入有效的邮箱地址'
      }
    }
  },
  // 官网
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: '请输入有效的网址'
      }
    }
  },
  // 简介
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  // 模型配置
  tableName: 'developers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// 定义模型之间的关联
Developer.associate = (models) => {
  // 开发者与用户的一对一关联
  Developer.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  })
  
  // 开发者与游戏的一对多关联
  Developer.hasMany(models.Game, {
    foreignKey: 'developer_id',
    as: 'games',
    onDelete: 'CASCADE'
  })
  
  // 开发者与财务报表的一对多关联
  Developer.hasMany(models.DeveloperFinance, {
    foreignKey: 'developer_id',
    as: 'finances',
    onDelete: 'CASCADE'
  })
  
  // 开发者与提现申请的一对多关联
  Developer.hasMany(models.WithdrawalRequest, {
    foreignKey: 'developer_id',
    as: 'withdrawalRequests',
    onDelete: 'CASCADE'
  })
}

export default Developer