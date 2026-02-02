'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class WeekTemplate extends Model {
    static associate(models) {
      WeekTemplate.hasMany(models.WeekTemplateSlot, { foreignKey: 'weekTemplateId', as: 'slots' })
    }
  }

  WeekTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
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
      modelName: 'WeekTemplate',
      tableName: 'week_templates',
      underscored: true,
    }
  )

  return WeekTemplate
}
