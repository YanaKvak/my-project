exports.seed = async function(knex) {
    const exists = await knex.schema.hasTable('task_tags');
    if (!exists) return;
    
    await knex('task_tags').del();
    return knex('task_tags').insert([
      { task_id: 1, tag_id: 1 },  // Homepage design -> Frontend
      { task_id: 1, tag_id: 4 },  // Homepage design -> Feature
      { task_id: 2, tag_id: 2 },  // API development -> Backend
      { task_id: 2, tag_id: 4 }   // API development -> Feature
    ]);
  };