import { Router } from 'express';
import { getDays } from '../controllers/days.controllers.js';
import { verifyToken } from '../middlewares/verify.js';

const router = Router();

router.get('/get/:workoutID', verifyToken, getDays);

export default router;