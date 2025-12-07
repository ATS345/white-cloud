import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// 定义WithdrawalRequest模型
const WithdrawalRequest = sequelize.define('WithdrawalRequest', {
  // 提现金额
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '提现金额不能为空'
      },
      min: {
        args: [10],
        msg: '提现金额不能低于10元'
      }
    }
  },
  // 提现方式
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '提现方式不能为空'
      }
    }
  },
  // 支付账号
  payment_account: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '支付账号不能为空'
      }
    }
  },
  // 提现状态
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processed'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'approved', 'rejected', 'processed']],
        msg: '提现状态必须是pending、approved、rejected或processed'
      }
    }
  },
  // 审核备注
  admin_note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 处理日期
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  // 开发者ID，与Developer模型关联
  developer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  // 模型配置
  tableName: 'withdrawal_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// 定义模型之间的关联
WithdrawalRequest.associate = (models) => {
  // 提现请求与开发者的多对一关联
  WithdrawalRequest.belongsTo(models.Developer, {
    foreignKey: 'developer_id',
    as: 'developer',
    onDelete: 'CASCADE'
  })
}

export default WithdrawalRequest