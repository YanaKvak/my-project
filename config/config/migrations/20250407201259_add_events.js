exports.up = function(knex) {
    return knex.schema.createTable('events', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.date('event_date').notNullable();
      table.time('event_time').notNullable();
      table.string('color', 7).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Внешний ключ для связи с таблицей users
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      
      // Индексы для ускорения запросов
      table.index(['user_id']);
      table.index(['event_date']);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('events');
  };