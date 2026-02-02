'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаём ENUM тип
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_meal_pickups_paid_by" AS ENUM ('balance', 'subscription');
    `)

    // Добавляем колонку
    await queryInterface.addColumn('meal_pickups', 'paid_by', {
      type: Sequelize.ENUM('balance', 'subscription'),
      allowNull: false,
      defaultValue: 'balance',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('meal_pickups', 'paid_by')
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_meal_pickups_paid_by";
    `)
  },
}
