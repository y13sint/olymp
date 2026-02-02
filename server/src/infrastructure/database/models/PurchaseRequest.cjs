'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class PurchaseRequest extends Model {
    static associate(models) {
      PurchaseRequest.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' })
      PurchaseRequest.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' })
      PurchaseRequest.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' })
    }
  }

  PurchaseRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
          model: 'products',
          key: 'id',
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'PurchaseRequest',
      tableName: 'purchase_requests',
      underscored: true,
    }
  )

  return PurchaseRequest
}
