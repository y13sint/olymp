'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class TemplateGroupItem extends Model {
    static associate(models) {
      TemplateGroupItem.belongsTo(models.TemplateGroup, { foreignKey: 'groupId', as: 'group' })
      TemplateGroupItem.belongsTo(models.MenuTemplate, { foreignKey: 'templateId', as: 'template' })
    }
  }

  TemplateGroupItem.init(
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
      modelName: 'TemplateGroupItem',
      tableName: 'template_group_items',
      underscored: true,
    }
  )

  return TemplateGroupItem
}
