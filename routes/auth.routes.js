import {Router} from 'express'
import { Signin , Login} from '../controllers/auth.controllers.js'
const router = Router();

router.post('/signin',Signin);
router.post('/login',Login);

export default router;