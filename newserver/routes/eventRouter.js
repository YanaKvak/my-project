import { Router } from 'express';
import eventController from '../controllers/eventController.js';
import validate from '../middleware/validate.js';
import { eventSchema } from '../utils/validators.js';

const router = Router();

router.get('/', validate(eventSchema.query), eventController.getAllEvents);
router.post('/', validate(eventSchema.create), eventController.createEvent);
router.put('/:id', validate(eventSchema.update), eventController.updateEvent);
router.delete('/:id', validate(eventSchema.id), eventController.deleteEvent);

export default router;