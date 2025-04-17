exports.seed = async function(knex) {
    const exists = await knex.schema.hasTable('tags');
    if (!exists) return;
    
    await knex('tags').del();
    return knex('tags').insert([
      { name: 'Frontend', color: '#3498db' },
      { name: 'Backend', color: '#2ecc71' },
      { name: 'Bug', color: '#e74c3c' },
      { name: 'Feature', color: '#9b59b6' }
    ]);
  };