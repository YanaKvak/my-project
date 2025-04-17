exports.seed = async function(knex) {
    const exists = await knex.schema.hasTable('team_members');
    if (!exists) return;
    
    await knex('team_members').del();
    return knex('team_members').insert([
      { team_id: 1, user_id: 1 },
      { team_id: 1, user_id: 2 },
      { team_id: 2, user_id: 1 }
    ]);
  };