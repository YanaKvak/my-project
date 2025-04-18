import Project from '../models/Project.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';

const getAllProjects = async (user) => {
  let projects;
  
  if (user.role === 'employee') {
    const teamMembers = await TeamMember.findAll({
      where: { users_id: user.id },
      attributes: ['team_id'],
    });
    const teamIds = teamMembers.map(member => member.team_id);

    if (teamIds.length === 0) {
      return [];
    }

    projects = await Project.findAll({
      where: { team_id: teamIds },
      include: [
        { model: Team, as: 'team', attributes: ['name'] },
      ],
    });
  } else {
    projects = await Project.findAll({
      include: [
        { model: Team, as: 'team', attributes: ['name'] },
      ],
  });
  }

  return projects;
};

const createProject = async ({ name, team_id, status, description, deadline }, user) => {
  const team = await Team.findByPk(team_id);
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }

  if (user.role === 'manager' && team.created_by !== user.id) {
    const err = new Error('Вы можете создавать проекты только для своих команд');
    err.status = 403;
    throw err;
  }

  return await Project.create({ name, team_id, status, description, deadline });
};

const updateProject = async (id, { name, team_id, status, description, deadline }, user) => {
  const project = await Project.findByPk(id, {
    include: [{ model: Team, as: 'team' }],
  });
  if (!project) {
    const err = new Error('Проект не найден');
    err.status = 404;
    throw err;
  }

  if (user.role === 'manager' && project.team.created_by !== user.id) {
    const err = new Error('Вы можете редактировать проекты только своих команд');
    err.status = 403;
    throw err;
  }

  const updates = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (status) updates.status = status;
  if (deadline) updates.deadline = deadline;

  if (team_id) {
    const team = await Team.findByPk(team_id);
    if (!team) {
      const err = new Error('Команда не найдена');
      err.status = 404;
      throw err;
    }
    if (user.role === 'manager' && team.created_by !== user.id) {
      const err = new Error('Вы можете переносить проекты только в свои команды');
      err.status = 403;
      throw err;
    }
    updates.team_id = team_id;
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error('Нет допустимых полей для обновления');
    err.status = 400;
    throw err;
  }

  await project.update(updates);
  return project;
};

export default { getAllProjects, createProject, updateProject };