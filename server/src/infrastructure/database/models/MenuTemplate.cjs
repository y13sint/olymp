'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class MenuTemplate extends Model {
    static associate(models) {
      MenuTemplate.hasMany(models.MenuTemplateItem, { foreignKey: 'templateId', as: 'items' })
      MenuTemplate.belongsToMany(models.TemplateGroup, {
        through: models.TemplateGroupItem,
        foreignKey: 'templateId',
        otherKey: 'groupId',
        as: 'groups',
      })
      MenuTemplate.hasMany(models.WeekTemplateSlot, { foreignKey: 'templateId', as: 'weekSlots' })
      MenuTemplate.hasMany(models.ShuffleUsage, { foreignKey: 'templateId', as: 'shuffleUsages' })
    }
  }

  MenuTemplate.init(
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
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
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
      modelName: 'MenuTemplate',
      tableName: 'menu_templates',
      underscored: true,
    }
  )

  return MenuTemplate
}
