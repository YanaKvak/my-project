import { Router } from "express";
import userRouter from './userRouter.js';
import teamRouter from './teamRouter.js';
import projectRouter from './projectRouter.js';
import taskRouter from './taskRouter.js';
import tagRouter from './tagRouter.js';
import eventRouter from './eventRouter.js';
import authRouter from './authRouter.js';

const router = new Router();

router.use('/users', userRouter);
router.use('/teams', teamRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/tags', tagRouter);
router.use('/events', eventRouter);
router.use('/auth', authRouter);

export default router;