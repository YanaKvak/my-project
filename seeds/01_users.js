exports.seed = function (knex) {
    return knex('users')
      .del() // Удаляем существующие данные
      .then(function () {
        return knex('users').insert([
          {
            username: 'admin',
            password: 'hashed_password_here', // Замените на хэшированный пароль
            email: 'admin@example.com',
          },
          {
            username: 'user',
            password: 'hashed_password_here', // Замените на хэшированный пароль
            email: 'user@example.com',
          },
        ]);
      });
  };