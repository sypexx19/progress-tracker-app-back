import { Router } from 'express';
import { addSport, getSports } from '../controllers/sport.controllers.js';
import { verifyToken } from '../middlewares/verify.js';
const router = Router();

router.post('/add', verifyToken, addSport);
router.get('/get', verifyToken, getSports);

export default router;