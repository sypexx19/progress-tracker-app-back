import { Router } from 'express'
import { createExerciseLog, getSessionDays, getSessionExercises } from '../controllers/session.controllers.js'
import { verifyToken } from '../middlewares/verify.js'

const router = Router()

router.get('/get/:sessionId', verifyToken, getSessionDays)
router.get('/getEx/:dayID', verifyToken, getSessionExercises)
router.post('/logs/:dayID', verifyToken, createExerciseLog)

export default router
