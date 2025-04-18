import tagService from '../services/tagService.js';

const getAllTags = async (req, res, next) => {
  try {
    const tags = await tagService.getAllTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
};

const createTag = async (req, res, next) => {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(201).json({ message: 'Тег успешно создан', id: tag.id });
  } catch (err) {
    next(err);
  }
};

const updateTag = async (req, res, next) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body);
    res.json({ message: 'Тег успешно обновлён', tag });
  } catch (err) {
    next(err);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    await tagService.deleteTag(req.params.id);
    res.status(200).json({ message: 'Тег успешно удалён' });
  } catch (err) {
    next(err);
  }
};

const addTagsToTask = async (req, res, next) => {
  try {
    const count = await tagService.addTagsToTask(req.params.id, req.body.tag_ids);
    res.status(201).json({ message: 'Теги успешно добавлены к задаче', count });
  } catch (err) {
    next(err);
  }
};

const removeTagFromTask = async (req, res, next) => {
  try {
    await tagService.removeTagFromTask(req.params.taskId, req.params.tagId);
    res.status(200).json({ message: 'Тег успешно удалён из задачи' });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  addTagsToTask,
  removeTagFromTask,
};