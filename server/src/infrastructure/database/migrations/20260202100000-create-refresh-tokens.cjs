'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
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
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    // Индекс для быстрого поиска по токену
    await queryInterface.addIndex('refresh_tokens', ['token'])
    // Индекс для удаления токенов пользователя
    await queryInterface.addIndex('refresh_tokens', ['user_id'])
    // Индекс для очистки просроченных токенов
    await queryInterface.addIndex('refresh_tokens', ['expires_at'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens')
  },
}
