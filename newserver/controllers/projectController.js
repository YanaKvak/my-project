import projectService from '../services/projectService.js';

const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects(req.user);
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user);
    res.status(201).json({ message: 'Проект успешно создан', project });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user);
    res.json({ message: 'Проект успешно обновлён', project });
  } catch (err) {
    next(err);
  }
};

export default { getAllProjects, createProject, updateProject };