import { Router } from "express";
import { getWorkouts, addWorkout, getDefaultWorkouts, saveWorkout } from "../controllers/workout.controllers.js";
import { verifyToken } from "../middlewares/verify.js";

const router = Router();
router.get("/get/default/:sportID", verifyToken, getDefaultWorkouts);
router.get("/get/:sportID", verifyToken, getWorkouts);
router.post("/add", verifyToken, addWorkout);
router.post("/save", verifyToken, saveWorkout);


export default router;