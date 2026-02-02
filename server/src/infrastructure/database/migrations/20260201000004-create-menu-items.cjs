'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      menu_day_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'menu_days',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      meal_type: {
        type: Sequelize.ENUM('breakfast', 'lunch'),
        allowNull: false,
      },
      allergens: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      calories: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addIndex('menu_items', ['menu_day_id'])
    await queryInterface.addIndex('menu_items', ['meal_type'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('menu_items')
  },
}
