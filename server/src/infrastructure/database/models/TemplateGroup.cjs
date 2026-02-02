'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class TemplateGroup extends Model {
    static associate(models) {
      TemplateGroup.belongsToMany(models.MenuTemplate, {
        through: models.TemplateGroupItem,
        foreignKey: 'groupId',
        otherKey: 'templateId',
        as: 'templates',
      })
      TemplateGroup.hasMany(models.WeekTemplateSlot, { foreignKey: 'groupId', as: 'weekSlots' })
      TemplateGroup.hasMany(models.ShuffleUsage, { foreignKey: 'groupId', as: 'shuffleUsages' })
    }
  }

  TemplateGroup.init(
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
      dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'day_of_week',
        validate: {
          min: 1,
          max: 7,
        },
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
      modelName: 'TemplateGroup',
      tableName: 'template_groups',
      underscored: true,
    }
  )

  return TemplateGroup
}
