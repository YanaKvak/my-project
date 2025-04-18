import { Router } from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { userSchema } from '../utils/validators.js';
import upload from '../middleware/upload.js';

const checkUserAccess = (req, res, next) => {
  if (req.user.role !== 'admin' && parseInt(req.params.id) !== req.user.id) {
    const err = new Error('У вас нет прав для доступа к данным этого пользователя');
    err.status = 403;
    return next(err);
  }
  next();
};

const router = Router();

router.get('/:id', authMiddleware, validate(userSchema.id), checkUserAccess, userController.getUserById);
router.get('/:id/teams', authMiddleware, validate(userSchema.id), checkUserAccess, userController.getUserTeams);
router.put('/:id/profile', authMiddleware, validate(userSchema.id), checkUserAccess, userController.updateProfile);
router.post('/:id/avatar', authMiddleware, validate(userSchema.id), checkUserAccess, upload.single('avatar'), userController.uploadAvatar);
router.delete('/:id/avatar', authMiddleware, validate(userSchema.id), checkUserAccess, userController.deleteAvatar);

export default router;