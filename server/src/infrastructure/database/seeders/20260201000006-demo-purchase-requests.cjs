'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Получаем ID повара
    const [cooks] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'cook' LIMIT 1"
    )

    // Получаем ID администратора
    const [admins] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    )

    // Получаем ID продуктов
    const [products] = await queryInterface.sequelize.query(
      "SELECT id, name FROM products ORDER BY id"
    )

    if (cooks.length > 0 && products.length >= 3) {
      const cookId = cooks[0].id
      const adminId = admins.length > 0 ? admins[0].id : null

      await queryInterface.bulkInsert('purchase_requests', [
        // Заявка на согласовании
        {
          product_id: products[0].id, // Молоко
          created_by: cookId,
          approved_by: null,
          quantity: 20,
          status: 'pending',
          comment: 'Заканчивается молоко, нужно пополнить запасы',
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Одобренная заявка
        {
          product_id: products[3].id, // Яйца
          created_by: cookId,
          approved_by: adminId,
          quantity: 100,
          status: 'approved',
          comment: 'Нужны яйца для завтраков',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        // Отклонённая заявка
        {
          product_id: products[5].id, // Сахар
          created_by: cookId,
          approved_by: adminId,
          quantity: 50,
          status: 'rejected',
          comment: 'Запрос на большую партию сахара',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ])
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('purchase_requests', null, {})
  },
}
