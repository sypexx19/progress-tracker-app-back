import { Router } from "express";
import {
    getWorkouts, saveWorkout,
    addWorkoutNonDefault, updateWorkoutName,
    deleteWorkout, createSession, getSessions, completeSession
} from "../controllers/workout.controllers.js";
import { verifyToken } from "../middlewares/verify.js";

const router = Router();
router.get("/get/:sportID", verifyToken, getWorkouts);
router.post("/save", verifyToken, saveWorkout);
router.post("/addNonDefault", verifyToken, addWorkoutNonDefault);
router.put("/update/:workoutID", verifyToken, updateWorkoutName);
router.delete("/delete/:workoutID", verifyToken, deleteWorkout);
router.post("/createSession", verifyToken, createSession);
router.get("/get/sessions/:userID", verifyToken, getSessions);
router.put("/completeSession/:sessionID", verifyToken, completeSession);


export default router;