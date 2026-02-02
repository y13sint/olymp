'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class MenuItemIngredient extends Model {
    static associate(models) {
      MenuItemIngredient.belongsTo(models.MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' })
      MenuItemIngredient.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' })
    }
  }

  MenuItemIngredient.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      menuItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'menu_item_id',
        references: {
          model: 'menu_items',
          key: 'id',
        },
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
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
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
      modelName: 'MenuItemIngredient',
      tableName: 'menu_item_ingredients',
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['menu_item_id', 'product_id'],
        },
      ],
    }
  )

  return MenuItemIngredient
}
