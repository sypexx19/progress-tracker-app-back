import { Router } from 'express';
import { addSport, getSports, getSportsDefault } from '../controllers/sport.controllers.js';
import { verifyToken } from '../middlewares/verify.js';
const router = Router();

router.post('/add', verifyToken, addSport);
router.get('/get', verifyToken, getSports);
router.get('/get/default', getSportsDefault);

export default router;