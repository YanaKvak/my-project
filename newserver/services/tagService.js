import { Op } from 'sequelize';
import Tag from '../models/Tag.js';
import Task from '../models/Task.js';
import TaskTag from '../models/TaskTag.js';

const getAllTags = async () => {
  const tags = await Tag.findAll();
  return tags;
};

const createTag = async ({ name, color }) => {
  const existingTag = await Tag.findOne({ where: { name } });
  if (existingTag) {
    const err = new Error('Тег с таким именем уже существует');
    err.status = 409;
    throw err;
  }

  const tag = await Tag.create({ name, color });
  return tag;
};

const updateTag = async (id, { name, color }) => {
  const tag = await Tag.findByPk(id);
  if (!tag) {
    const err = new Error('Тег не найден');
    err.status = 404;
    throw err;
  }

  const updates = {};
  if (name) updates.name = name;
  if (color) updates.color = color;

  await tag.update(updates);
  return tag;
};

const deleteTag = async (id) => {
  const tag = await Tag.findByPk(id);
  if (!tag) {
    const err = new Error('Тег не найден');
    err.status = 404;
    throw err;
  }
  await tag.destroy();
};

const addTagsToTask = async (taskId, tagIds) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    const err = new Error('Задача не найдена');
    err.status = 404;
    throw err;
  }

  const existingTags = await Tag.findAll({ where: { id: tagIds } });
  if (existingTags.length !== tagIds.length) {
    const err = new Error('Один или несколько тегов не найдены');
    err.status = 400;
    throw err;
  }

  const existingRelations = await TaskTag.findAll({
    where: { task_id: taskId, tag_id: tagIds },
  });

  const existingTagIds = existingRelations.map((r) => r.tag_id);
  const newTagIds = tagIds.filter((id) => !existingTagIds.includes(id));

  if (newTagIds.length === 0) {
    const err = new Error('Все теги уже привязаны к этой задаче');
    err.status = 200;
    throw err;
  }

  const inserts = newTagIds.map((tag_id) => ({
    task_id: taskId,
    tag_id,
  }));

  await TaskTag.bulkCreate(inserts);
  return inserts.length;
};

const removeTagFromTask = async (taskId, tagId) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    const err = new Error('Задача не найдена');
    err.status = 404;
    throw err;
  }

  const tag = await Tag.findByPk(tagId);
  if (!tag) {
    const err = new Error('Тег не найден');
    err.status = 404;
    throw err;
  }

  const relation = await TaskTag.findOne({
    where: { task_id: taskId, tag_id: tagId },
  });
  if (!relation) {
    const err = new Error('Тег не привязан к этой задаче');
    err.status = 400;
    throw err;
  }

  await relation.destroy();
};

export default {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  addTagsToTask,
  removeTagFromTask,
};