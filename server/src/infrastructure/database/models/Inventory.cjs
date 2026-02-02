'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' })
    }
  }

  Inventory.init(
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
      quantityChange: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'quantity_change',
      },
      reason: {
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
      modelName: 'Inventory',
      tableName: 'inventory',
      underscored: true,
    }
  )

  return Inventory
}
