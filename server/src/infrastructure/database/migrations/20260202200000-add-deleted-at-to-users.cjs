'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    })

    // Добавляем индекс для оптимизации запросов с soft delete
    await queryInterface.addIndex('users', ['deleted_at'], {
      name: 'users_deleted_at_idx',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_deleted_at_idx')
    await queryInterface.removeColumn('users', 'deleted_at')
  },
}
