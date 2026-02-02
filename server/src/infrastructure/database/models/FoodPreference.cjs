'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class FoodPreference extends Model {
    static associate(models) {
      FoodPreference.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    }
  }

  FoodPreference.init(
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
      preferenceName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'preference_name',
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
      modelName: 'FoodPreference',
      tableName: 'food_preferences',
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'preference_name'],
          name: 'unique_user_preference',
        },
      ],
    }
  )

  return FoodPreference
}
