exports.seed = async function(knex) {
    const exists = await knex.schema.hasTable('task_status');
    if (!exists) return;
    
    await knex('task_status').del();
    return knex('task_status').insert([
      { name: 'To Do', color: '#FF5733', created_by: 1 },
      { name: 'In Progress', color: '#33A1FF', created_by: 1 },
      { name: 'Done', color: '#33FF57', created_by: 1 }
    ]);
  };