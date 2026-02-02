'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('products', [
      {
        name: 'Молоко',
        unit: 'л',
        quantity: 50,
        min_quantity: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Хлеб белый',
        unit: 'шт',
        quantity: 100,
        min_quantity: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Масло сливочное',
        unit: 'кг',
        quantity: 5,
        min_quantity: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Яйца куриные',
        unit: 'шт',
        quantity: 200,
        min_quantity: 50,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Мука пшеничная',
        unit: 'кг',
        quantity: 25,
        min_quantity: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Сахар',
        unit: 'кг',
        quantity: 15,
        min_quantity: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Картофель',
        unit: 'кг',
        quantity: 80,
        min_quantity: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Морковь',
        unit: 'кг',
        quantity: 30,
        min_quantity: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Курица',
        unit: 'кг',
        quantity: 20,
        min_quantity: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Рис',
        unit: 'кг',
        quantity: 15,
        min_quantity: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Гречка',
        unit: 'кг',
        quantity: 12,
        min_quantity: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Макароны',
        unit: 'кг',
        quantity: 18,
        min_quantity: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {})
  },
}
