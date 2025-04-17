exports.seed = async function(knex) {
    const exists = await knex.schema.hasTable('projects');
    if (!exists) return;
    
    await knex('projects').del();
    return knex('projects').insert([
      { 
        name: 'Website Redesign', 
        description: 'Complete website redesign project',
        team_id: 1,
        status: 'active',
        deadline: '2024-12-31'
      },
      {
        name: 'Mobile App',
        description: 'New mobile application development',
        team_id: 2,
        status: 'active',
        deadline: '2024-11-30'
      }
    ]);
  };