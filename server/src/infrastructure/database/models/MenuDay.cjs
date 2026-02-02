'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class MenuDay extends Model {
    static associate(models) {
      MenuDay.hasMany(models.MenuItem, { foreignKey: 'menuDayId', as: 'menuItems' })
    }
  }

  MenuDay.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      menuDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
        field: 'menu_date',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
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
      modelName: 'MenuDay',
      tableName: 'menu_days',
      underscored: true,
    }
  )

  return MenuDay
}
