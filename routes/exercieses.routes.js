import { Router } from "express";
import { getExercises, deleteEx, getType, getDefaultExercises, addExercise, addDefaultExercises } from "../controllers/exercises.controllers.js";
import { verifyToken } from "../middlewares/verify.js";

const router = Router();

router.get("/get/:dayID", verifyToken, getExercises);
router.delete("/delete/:id", verifyToken, deleteEx);
router.get("/type", verifyToken, getType);
router.get("/default/:typeID", verifyToken, getDefaultExercises);
router.post("/add", verifyToken, addExercise);
router.post("/addDefault", verifyToken, addDefaultExercises);

export default router;
