import { Router } from 'express';
import projectController from '../controllers/projectController.js';
import validate from '../middleware/validate.js';
import { projectSchema } from '../utils/validators.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authMiddleware, projectController.getAllProjects);
router.post('/', authMiddleware, roleMiddleware(['manager', 'admin']), validate(projectSchema.create), projectController.createProject);
router.put('/:id', authMiddleware, roleMiddleware(['manager', 'admin']), validate(projectSchema.update), projectController.updateProject);

export default router;