import Task from '../models/Task.js';
import Project from '../models/Project.js';
import TaskStatus from '../models/TaskStatus.js';
import User from '../models/User.js';
import Tag from '../models/Tag.js';

const getAllTasks = async () => {
  return await Task.findAll({
    include: [
      { model: Project, as: 'project', attributes: ['name'] },
      { model: TaskStatus, as: 'status', attributes: ['name', 'color'] },
      { model: User, as: 'creator', attributes: ['username'] },
      { model: Tag, as: 'tags', attributes: ['name', 'color'] },
    ],
  });
};

const createTask = async ({ title, project_id, status_id, creator_id, priority, due_date, description }) => {
  const [project, status, creator] = await Promise.all([
    Project.findByPk(project_id),
    TaskStatus.findByPk(status_id),
    User.findByPk(creator_id),
  ]);

  if (!project) {
    const err = new Error('Проект не найден');
    err.status = 404;
    throw err;
  }
  if (!status) {
    const err = new Error('Статус не найден');
    err.status = 404;
    throw err;
  }
  if (!creator) {
    const err = new Error('Создатель не найден');
    err.status = 404;
    throw err;
  }

  return await Task.create({ title, project_id, status_id, creator_id, priority, due_date, description });
};

const updateTask = async (id, { title, project_id, status_id, creator_id, priority, due_date, description }, user) => {
  const task = await Task.findByPk(id);
  if (!task) {
    const err = new Error('Задача не найдена');
    err.status = 404;
    throw err;
  }

  // Проверка для employee: может редактировать только свои задачи
  if (user.role === 'employee' && task.creator_id !== user.id) {
    const err = new Error('У вас нет прав для редактирования этой задачи');
    err.status = 403;
    throw err;
  }

  const updates = {};
  if (title) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (priority) updates.priority = priority;
  if (due_date) updates.due_date = due_date;

  if (project_id) {
    const project = await Project.findByPk(project_id);
    if (!project) {
      const err = new Error('Проект не найден');
      err.status = 404;
      throw err;
    }
    updates.project_id = project_id;
  }

  if (status_id) {
    const status = await TaskStatus.findByPk(status_id);
    if (!status) {
      const err = new Error('Статус не найден');
      err.status = 404;
      throw err;
    }
    updates.status_id = status_id;
  }

  if (creator_id) {
    const creator = await User.findByPk(creator_id);
    if (!creator) {
      const err = new Error('Создатель не найден');
      err.status = 404;
      throw err;
    }
    updates.creator_id = creator_id;
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error('Нет допустимых полей для обновления');
    err.status = 400;
    throw err;
  }

  await task.update(updates);
  return task;
};

const deleteTask = async (id, user) => {
  const task = await Task.findByPk(id);
  if (!task) {
    const err = new Error('Задача не найдена');
    err.status = 404;
    throw err;
  }

  // employee может удалять только свои задачи
  if (user.role === 'employee' && task.creator_id !== user.id) {
    const err = new Error('У вас нет прав для удаления этой задачи');
    err.status = 403;
    throw err;
  }

  await task.destroy();
};

export default { getAllTasks, createTask, updateTask, deleteTask };