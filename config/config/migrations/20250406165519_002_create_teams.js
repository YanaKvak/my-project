exports.up = function(knex) {
    return knex.schema.createTable('teams', table => {
      table.increments('id').primary();
      table.string('name', 50).notNullable();
      table.text('description');
      table.integer('created_by').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('created_by').references('id').inTable('users');
    });
  };