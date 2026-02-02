'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('week_template_slots', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      week_template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'week_templates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'menu_templates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'template_groups',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('week_template_slots', ['week_template_id'])
    await queryInterface.addIndex('week_template_slots', ['day_of_week'])
    await queryInterface.addIndex('week_template_slots', ['week_template_id', 'day_of_week'], { unique: true })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('week_template_slots')
  },
}
