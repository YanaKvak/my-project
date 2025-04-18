import teamService from '../services/teamService.js';

const getAllTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getAllTeams();
    res.json(teams);
  } catch (err) {
    next(err);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.json(team);
  } catch (err) {
    next(err);
  }
};

const getTeamMembers = async (req, res, next) => {
  try {
    const members = await teamService.getTeamMembers(req.params.id);
    res.json(members);
  } catch (err) {
    next(err);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json({ message: 'Команда успешно создана', team });
  } catch (err) {
    next(err);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(req.params.id, req.body, req.user);
    res.json({ message: 'Команда успешно обновлена', team });
  } catch (err) {
    next(err);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    await teamService.deleteTeam(req.params.id, req.user);
    res.status(204).json({ message: 'Команда успешно удалена' });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    await teamService.addMember(req.params.id, userId);
    res.status(201).json({ message: 'Участник успешно добавлен в команду' });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await teamService.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Участник успешно удалён из команды' });
  } catch (err) {
    next(err);
  }
};

export default { getAllTeams, getTeamById, getTeamMembers, createTeam, updateTeam, deleteTeam, addMember, removeMember };