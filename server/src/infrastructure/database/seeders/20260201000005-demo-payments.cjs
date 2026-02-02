'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Получаем ID студентов
    const [students] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'student' ORDER BY id"
    )

    if (students.length >= 3) {
      await queryInterface.bulkInsert('payments', [
        // Разовые платежи
        {
          user_id: students[0].id,
          amount: 500.00,
          type: 'single',
          status: 'completed',
          description: 'Пополнение баланса',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 дней назад
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          user_id: students[0].id,
          amount: 1000.00,
          type: 'single',
          status: 'completed',
          description: 'Пополнение баланса',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 дня назад
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          user_id: students[1].id,
          amount: 800.00,
          type: 'single',
          status: 'completed',
          description: 'Пополнение баланса',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        // Оплата абонемента
        {
          user_id: students[2].id,
          amount: 2000.00,
          type: 'subscription',
          status: 'completed',
          description: 'Оплата абонемента на месяц (полное питание)',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ])

      // Создаём подписку для третьего студента
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      await queryInterface.bulkInsert('subscriptions', [
        {
          user_id: students[2].id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          type: 'full',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('subscriptions', null, {})
    await queryInterface.bulkDelete('payments', null, {})
  },
}
