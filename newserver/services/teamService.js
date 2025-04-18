import Team from '../models/Team.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';

const getAllTeams = async () => {
  return await Team.findAll({
    include: [
      { model: User, as: 'creator', attributes: ['username'] },
      { model: User, as: 'members', attributes: ['id', 'username'] },
    ],
  });
};

const getTeamById = async (id) => {
  const team = await Team.findByPk(id, {
    include: [
      { model: User, as: 'creator', attributes: ['username'] },
      { model: User, as: 'members', attributes: ['id', 'username'] },
    ],
  });
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }
  return team;
};

const getTeamMembers = async (teamId) => {
  const team = await Team.findByPk(teamId, {
    include: [
      { model: User, as: 'members', attributes: ['id', 'username'] },
    ],
  });
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }
  return team.members;
};

const createTeam = async ({ name, description, created_by }) => {
  const existingTeam = await Team.findOne({ where: { name } });
  if (existingTeam) {
    const err = new Error('Команда с таким названием уже существует');
    err.status = 409;
    throw err;
  }

  if (created_by) {
    const user = await User.findByPk(created_by);
    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 400;
      throw err;
    }
  }

  return await Team.create({ name, description, created_by });
};

const updateTeam = async (id, { name, description, created_by }, user) => {
  const team = await Team.findByPk(id);
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }

  if (user.role === 'manager' && team.created_by !== user.id) {
    const err = new Error('У вас нет прав для редактирования этой команды');
    err.status = 403;
    throw err;
  }

  if (name) {
    const existingTeam = await Team.findOne({ where: { name } });
    if (existingTeam && existingTeam.id !== parseInt(id)) {
      const err = new Error('Команда с таким названием уже существует');
      err.status = 409;
      throw err;
    }
  }

  if (created_by) {
    const user = await User.findByPk(created_by);
    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 400;
      throw err;
    }
  }

  const updates = { name, description, created_by };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  if (Object.keys(updates).length === 0) {
    const err = new Error('Нет допустимых полей для обновления');
    err.status = 400;
    throw err;
  }

  await team.update(updates);
  return team;
};

const deleteTeam = async (id, user) => {
  const team = await Team.findByPk(id);
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }

  if (user.role === 'manager' && team.created_by !== user.id) {
    const err = new Error('У вас нет прав для удаления этой команды');
    err.status = 403;
    throw err;
  }

  const projectCount = await Project.count({ where: { team_id: id } });
  if (projectCount > 0) {
    const err = new Error('Нельзя удалить команду, у которой есть проекты');
    err.status = 400;
    throw err;
  }

  await team.destroy();
};

const addMember = async (teamId, userId) => {
  const team = await Team.findByPk(teamId);
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }

  if (user.role !== 'employee') {
    const err = new Error('В команду можно добавлять только пользователей с ролью employee');
    err.status = 403;
    throw err;
  }

  const existingMember = await TeamMember.findOne({ where: { team_id: teamId, users_id: userId } });
  if (existingMember) {
    const err = new Error('Пользователь уже является участником команды');
    err.status = 409;
    throw err;
  }

  await TeamMember.create({ team_id: teamId, users_id: userId });
};

const removeMember = async (teamId, userId) => {
  const team = await Team.findByPk(teamId);
  if (!team) {
    const err = new Error('Команда не найдена');
    err.status = 404;
    throw err;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }

  const member = await TeamMember.findOne({ where: { team_id: teamId, users_id: userId } });
  if (!member) {
    const err = new Error('Пользователь не является участником команды');
    err.status = 404;
    throw err;
  }

  await member.destroy();
};

export default { getAllTeams, getTeamById, getTeamMembers, createTeam, updateTeam, deleteTeam, addMember, removeMember };