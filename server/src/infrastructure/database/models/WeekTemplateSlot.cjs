'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class WeekTemplateSlot extends Model {
    static associate(models) {
      WeekTemplateSlot.belongsTo(models.WeekTemplate, { foreignKey: 'weekTemplateId', as: 'weekTemplate' })
      WeekTemplateSlot.belongsTo(models.MenuTemplate, { foreignKey: 'templateId', as: 'template' })
      WeekTemplateSlot.belongsTo(models.TemplateGroup, { foreignKey: 'groupId', as: 'group' })
    }
  }

  WeekTemplateSlot.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      weekTemplateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'week_template_id',
        references: {
          model: 'week_templates',
          key: 'id',
        },
      },
      dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'day_of_week',
        validate: {
          min: 1,
          max: 7,
        },
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'template_id',
        references: {
          model: 'menu_templates',
          key: 'id',
        },
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'group_id',
        references: {
          model: 'template_groups',
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
      modelName: 'WeekTemplateSlot',
      tableName: 'week_template_slots',
      underscored: true,
    }
  )

  return WeekTemplateSlot
}
