exports.seed = async function(knex) {
    const exists = await knex.schema.hasTable('tasks');
    if (!exists) return;
    
    await knex('tasks').del();
    return knex('tasks').insert([
      {
        title: 'Design homepage',
        description: 'Create new homepage layout',
        project_id: 1,
        status_id: 1,
        creator_id: 1,
        priority: 'high',
        due_date: '2024-10-15'
      },
      {
        title: 'API development',
        description: 'Develop backend API endpoints',
        project_id: 2,
        status_id: 2,
        creator_id: 2,
        priority: 'medium',
        due_date: '2024-09-30'
      }
    ]);
  };