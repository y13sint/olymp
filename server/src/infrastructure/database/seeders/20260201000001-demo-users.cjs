'use strict'

const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('password123', 10)

    await queryInterface.bulkInsert('users', [
      // Администратор
      {
        email: 'admin@school.ru',
        password_hash: passwordHash,
        full_name: 'Иванов Иван Иванович',
        role: 'admin',
        class_number: null,
        class_letter: null,
        balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Повар
      {
        email: 'cook@school.ru',
        password_hash: passwordHash,
        full_name: 'Петрова Мария Сергеевна',
        role: 'cook',
        class_number: null,
        class_letter: null,
        balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Ученики
      {
        email: 'student1@school.ru',
        password_hash: passwordHash,
        full_name: 'Сидоров Алексей Петрович',
        role: 'student',
        class_number: 9,
        class_letter: 'А',
        balance: 1500.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'student2@school.ru',
        password_hash: passwordHash,
        full_name: 'Козлова Анна Дмитриевна',
        role: 'student',
        class_number: 10,
        class_letter: 'Б',
        balance: 800.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'student3@school.ru',
        password_hash: passwordHash,
        full_name: 'Морозов Дмитрий Александрович',
        role: 'student',
        class_number: 11,
        class_letter: 'В',
        balance: 2000.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {})
  },
}
