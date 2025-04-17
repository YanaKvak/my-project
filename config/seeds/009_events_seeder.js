exports.seed = function(knex) {
    // Удаляем существующие данные
    return knex('events').del()
      .then(function () {
        // Вставляем тестовые данные
        return knex('events').insert([
          {
            user_id: 1,
            title: 'Встреча с командой',
            description: 'Обсуждение нового проекта',
            event_date: '2024-04-10',
            event_time: '14:00:00',
            color: '#9A48EA'
          },
          {
            user_id: 1,
            title: 'Обед с клиентом',
            description: 'Ресторан "Весна"',
            event_date: '2024-04-12',
            event_time: '13:00:00',
            color: '#59b25c'
          },
          {
            user_id: 2,
            title: 'Презентация продукта',
            description: 'Для инвесторов',
            event_date: '2024-04-15',
            event_time: '10:30:00',
            color: '#1b8df7'
          }
        ]);
      });
  };