'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class MenuTemplateItem extends Model {
    static associate(models) {
      MenuTemplateItem.belongsTo(models.MenuTemplate, { foreignKey: 'templateId', as: 'template' })
    }
  }

  MenuTemplateItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      mealType: {
        type: DataTypes.ENUM('breakfast', 'lunch'),
        allowNull: false,
        field: 'meal_type',
      },
      allergens: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      calories: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: 'MenuTemplateItem',
      tableName: 'menu_template_items',
      underscored: true,
    }
  )

  return MenuTemplateItem
}
