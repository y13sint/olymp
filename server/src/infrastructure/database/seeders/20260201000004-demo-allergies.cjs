'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Получаем ID студентов
    const [students] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'student' ORDER BY id"
    )

    if (students.length >= 2) {
      await queryInterface.bulkInsert('allergies', [
        // У первого студента аллергия на молоко
        {
          user_id: students[0].id,
          allergen_name: 'молоко',
          created_at: new Date(),
          updated_at: new Date(),
        },
        // У второго студента аллергия на глютен и яйца
        {
          user_id: students[1].id,
          allergen_name: 'глютен',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: students[1].id,
          allergen_name: 'яйца',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('allergies', null, {})
  },
}
