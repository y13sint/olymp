'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class MenuItem extends Model {
    static associate(models) {
      MenuItem.belongsTo(models.MenuDay, { foreignKey: 'menuDayId', as: 'menuDay' })
      MenuItem.hasMany(models.MealPickup, { foreignKey: 'menuItemId', as: 'mealPickups' })
      MenuItem.hasMany(models.Review, { foreignKey: 'menuItemId', as: 'reviews' })
      MenuItem.hasMany(models.MenuItemIngredient, { foreignKey: 'menuItemId', as: 'ingredients' })
    }
  }

  MenuItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      menuDayId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'menu_day_id',
        references: {
          model: 'menu_days',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      mealType: {
        type: DataTypes.ENUM('breakfast', 'lunch'),
        allowNull: false,
        field: 'meal_type',
      },
      allergens: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      calories: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_available',
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
      modelName: 'MenuItem',
      tableName: 'menu_items',
      underscored: true,
    }
  )

  return MenuItem
}
