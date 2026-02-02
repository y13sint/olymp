'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Payment, { foreignKey: 'userId', as: 'payments' })
      User.hasMany(models.Subscription, { foreignKey: 'userId', as: 'subscriptions' })
      User.hasMany(models.MealPickup, { foreignKey: 'userId', as: 'mealPickups' })
      User.hasMany(models.Review, { foreignKey: 'userId', as: 'reviews' })
      User.hasMany(models.Allergy, { foreignKey: 'userId', as: 'allergies' })
      User.hasMany(models.FoodPreference, { foreignKey: 'userId', as: 'foodPreferences' })
      User.hasMany(models.PurchaseRequest, { foreignKey: 'createdBy', as: 'createdRequests' })
      User.hasMany(models.PurchaseRequest, { foreignKey: 'approvedBy', as: 'approvedRequests' })
      User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' })
      User.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' })
    }

    toJSON() {
      const values = { ...this.get() }
      delete values.passwordHash
      delete values.deletedAt // Скрываем от клиента
      return values
    }

    /**
     * Проверить, удалён ли пользователь (soft delete)
     */
    isDeleted() {
      return this.deletedAt !== null
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      fullName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'full_name',
      },
      role: {
        type: DataTypes.ENUM('student', 'cook', 'admin'),
        allowNull: false,
        defaultValue: 'student',
      },
      classNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'class_number',
        validate: {
          min: 1,
          max: 11,
        },
      },
      classLetter: {
        type: DataTypes.STRING(1),
        allowNull: true,
        field: 'class_letter',
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      paranoid: true, // Включаем soft delete
    }
  )

  return User
}
