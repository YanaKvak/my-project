exports.seed = async function(knex) {
  const exists = await knex.schema.hasTable('users');
  if (!exists) return;
  
  await knex('users').del();
  return knex('users').insert([
    {
      username: 'admin',
      email: 'admin@example.com',
      password_hash: '$2a$10$hashedpassword',
      role: 'manager'
    },
    {
      username: 'user1',
      email: 'user1@example.com',
      password_hash: '$2a$10$hashedpassword',
      role: 'employee'
    }
  ]);
};