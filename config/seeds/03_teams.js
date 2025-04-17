exports.seed = async function(knex) {
  const exists = await knex.schema.hasTable('teams');
  if (!exists) return;
  
  await knex('teams').del();
  return knex('teams').insert([
    { name: 'Developers', description: 'Main development team', created_by: 1 },
    { name: 'Designers', description: 'UI/UX team', created_by: 1 }
  ]);
};