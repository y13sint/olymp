'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Создаём меню на текущую неделю
    const today = new Date()
    const menuDays = []

    // Генерируем 5 дней (пн-пт)
    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      menuDays.push({
        menu_date: date.toISOString().split('T')[0],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    await queryInterface.bulkInsert('menu_days', menuDays)

    // Получаем ID созданных дней меню
    const [days] = await queryInterface.sequelize.query(
      'SELECT id, menu_date FROM menu_days ORDER BY menu_date'
    )

    // Блюда для завтрака
    const breakfastItems = [
      { name: 'Каша овсяная с маслом', description: 'Овсяная каша на молоке с сливочным маслом', price: 80, calories: 250, allergens: 'глютен, молоко' },
      { name: 'Каша гречневая', description: 'Гречневая каша с молоком', price: 70, calories: 220, allergens: 'молоко' },
      { name: 'Омлет', description: 'Омлет из двух яиц с молоком', price: 90, calories: 280, allergens: 'яйца, молоко' },
      { name: 'Сырники со сметаной', description: 'Сырники из творога со сметаной', price: 100, calories: 320, allergens: 'глютен, молоко, яйца' },
      { name: 'Блинчики с творогом', description: 'Блины с творожной начинкой', price: 110, calories: 350, allergens: 'глютен, молоко, яйца' },
    ]

    // Блюда для обеда
    const lunchItems = [
      { name: 'Борщ', description: 'Борщ украинский со сметаной', price: 120, calories: 180, allergens: null },
      { name: 'Суп куриный с лапшой', description: 'Куриный суп с домашней лапшой', price: 110, calories: 150, allergens: 'глютен' },
      { name: 'Котлета куриная с пюре', description: 'Куриная котлета с картофельным пюре', price: 150, calories: 420, allergens: 'глютен, яйца, молоко' },
      { name: 'Рыба запечённая с рисом', description: 'Филе минтая с гарниром из риса', price: 160, calories: 380, allergens: 'рыба' },
      { name: 'Плов с курицей', description: 'Плов узбекский с куриным мясом', price: 140, calories: 450, allergens: null },
    ]

    const menuItems = []

    days.forEach((day, index) => {
      // Завтрак
      menuItems.push({
        menu_day_id: day.id,
        name: breakfastItems[index].name,
        description: breakfastItems[index].description,
        price: breakfastItems[index].price,
        meal_type: 'breakfast',
        allergens: breakfastItems[index].allergens,
        calories: breakfastItems[index].calories,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Обед
      menuItems.push({
        menu_day_id: day.id,
        name: lunchItems[index].name,
        description: lunchItems[index].description,
        price: lunchItems[index].price,
        meal_type: 'lunch',
        allergens: lunchItems[index].allergens,
        calories: lunchItems[index].calories,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
    })

    await queryInterface.bulkInsert('menu_items', menuItems)
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('menu_items', null, {})
    await queryInterface.bulkDelete('menu_days', null, {})
  },
}
