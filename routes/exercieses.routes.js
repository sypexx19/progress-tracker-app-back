import { Router } from "express";
import { getExercises } from "../controllers/exercises.controllers.js";
import { verifyToken } from "../middlewares/verify.js";

const router = Router();

router.get("/get/:dayID", verifyToken, getExercises);

export default router;
