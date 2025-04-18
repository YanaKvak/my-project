import { Router } from 'express';
import teamController from '../controllers/teamController.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import validate from '../middleware/validate.js';
import { teamSchema, teamMemberSchema } from '../utils/validators.js';

const router = Router();

router.get('/', authMiddleware, teamController.getAllTeams);
router.get('/:id', authMiddleware, validate(teamSchema.id), teamController.getTeamById);
router.get('/:id/members', authMiddleware, validate(teamSchema.id), teamController.getTeamMembers);
router.post('/', authMiddleware, roleMiddleware(['manager', 'admin']), validate(teamSchema.create), teamController.createTeam);
router.put('/:id', authMiddleware, roleMiddleware(['manager', 'admin']), validate(teamSchema.update), teamController.updateTeam);
router.delete('/:id', authMiddleware, roleMiddleware(['manager', 'admin']), validate(teamSchema.id), teamController.deleteTeam);
router.post('/:id/members', authMiddleware, roleMiddleware(['manager', 'admin']), validate(teamMemberSchema.add), teamController.addMember);
router.delete('/:id/members/:userId', authMiddleware, roleMiddleware(['manager', 'admin']), validate(teamMemberSchema.remove), teamController.removeMember);

export default router;