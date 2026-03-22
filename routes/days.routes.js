import { Router } from 'express';
import { getDays, addDays, deleteDay } from '../controllers/days.controllers.js';
import { verifyToken } from '../middlewares/verify.js';

const router = Router();

router.get('/get/:workoutID', verifyToken, getDays);
router.post('/add/:workoutID', verifyToken, addDays);
router.delete('/delete/:dayID', verifyToken, deleteDay);

export default router;