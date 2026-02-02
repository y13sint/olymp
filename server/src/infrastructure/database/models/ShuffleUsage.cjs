'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class ShuffleUsage extends Model {
    static associate(models) {
      ShuffleUsage.belongsTo(models.TemplateGroup, { foreignKey: 'groupId', as: 'group' })
      ShuffleUsage.belongsTo(models.MenuTemplate, { foreignKey: 'templateId', as: 'template' })
    }
  }

  ShuffleUsage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'group_id',
        references: {
          model: 'template_groups',
          key: 'id',
        },
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'template_id',
        references: {
          model: 'menu_templates',
          key: 'id',
        },
      },
      usedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'used_date',
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
      modelName: 'ShuffleUsage',
      tableName: 'shuffle_usages',
      underscored: true,
    }
  )

  return ShuffleUsage
}
