import { Router } from 'express';
import tagController from '../controllers/tagController.js';
import validate from '../middleware/validate.js';
import { tagSchema, taskTagSchema } from '../utils/validators.js';

const router = Router();

router.get('/', tagController.getAllTags);
router.post('/', validate(tagSchema.create), tagController.createTag);
router.put('/:id', validate(tagSchema.update), tagController.updateTag);
router.delete('/:id', validate(tagSchema.id), tagController.deleteTag);
router.post('/tasks/:id/tags', validate(taskTagSchema.create), tagController.addTagsToTask);
router.delete('/tasks/:taskId/tags/:tagId', validate(taskTagSchema.delete), tagController.removeTagFromTask);

export default router;