'use strict'

const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class Allergy extends Model {
    static associate(models) {
      Allergy.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    }
  }

  Allergy.init(
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
      allergenName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'allergen_name',
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
      modelName: 'Allergy',
      tableName: 'allergies',
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'allergen_name'],
          name: 'unique_user_allergen',
        },
      ],
    }
  )

  return Allergy
}
