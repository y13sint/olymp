'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_item_ingredients', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
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

    await queryInterface.addIndex('menu_item_ingredients', ['menu_item_id', 'product_id'], {
      unique: true,
      name: 'menu_item_ingredients_unique',
    })

    await queryInterface.addIndex('menu_item_ingredients', ['product_id'], {
      name: 'menu_item_ingredients_product_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('menu_item_ingredients')
  },
}
