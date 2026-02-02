'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class MealPickup extends Model {
    static associate(models) {
      MealPickup.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
      MealPickup.belongsTo(models.MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' })
    }
  }

  MealPickup.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
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
      pickupDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'pickup_date',
      },
      mealType: {
        type: DataTypes.ENUM('breakfast', 'lunch'),
        allowNull: false,
        field: 'meal_type',
      },
      isReceived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_received',
      },
      receivedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'received_at',
      },
      paidBy: {
        type: DataTypes.ENUM('balance', 'subscription'),
        allowNull: false,
        defaultValue: 'balance',
        field: 'paid_by',
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
      modelName: 'MealPickup',
      tableName: 'meal_pickups',
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'pickup_date', 'meal_type'],
          name: 'unique_user_meal_per_day',
        },
      ],
    }
  )

  return MealPickup
}
