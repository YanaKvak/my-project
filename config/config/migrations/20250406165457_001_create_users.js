// migrations/xxxx_create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('email', 100).notNullable().unique();
    table.string('password_hash', 100).notNullable();
    table.string('avatar_url', 255).nullable(); // URL к аватару
    table.text('avatar_data').nullable(); // Base64 данные аватара (если нужно)
    table.enu('role', ['manager', 'employee']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};