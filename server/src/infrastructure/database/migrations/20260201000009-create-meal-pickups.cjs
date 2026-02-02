'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meal_pickups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      menu_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'menu_items',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pickup_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      meal_type: {
        type: Sequelize.ENUM('breakfast', 'lunch'),
        allowNull: false,
      },
      is_received: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('meal_pickups', ['user_id', 'pickup_date', 'meal_type'], {
      unique: true,
      name: 'unique_user_meal_per_day',
    })
    await queryInterface.addIndex('meal_pickups', ['pickup_date'])
    await queryInterface.addIndex('meal_pickups', ['is_received'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('meal_pickups')
  },
}
