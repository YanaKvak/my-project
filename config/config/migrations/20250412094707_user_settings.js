exports.up = function(knex) {
    return knex.schema.createTable('user_settings', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.boolean('dark_mode').defaultTo(true);
      table.boolean('high_contrast').defaultTo(false);
      table.string('language', 10).defaultTo('ru');
      table.integer('font_size').defaultTo(16);
      table.boolean('voice_assistant').defaultTo(false);
      table.string('accent_color', 20).defaultTo('#9A48EA');
      table.string('date_format', 20).defaultTo('DD.MM.YYYY');
      table.string('timezone', 50).defaultTo('Москва (UTC+3)');
      table.boolean('two_factor_auth').defaultTo(false);
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.unique(['user_id']); // У каждого пользователя только одни настройки
    });
  };