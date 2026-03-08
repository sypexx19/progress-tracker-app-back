import db from "../db.js";

export const getWorkouts = async (req, res) => {
    const { sportID } = req.params;
    try {
        const [workouts] = await db.query("SELECT * FROM workouts WHERE sport_id = ?", [sportID]);
        return res.json(workouts);
    }
    catch (err) {
        return res.json(err);
    }
};

export const addWorkout = async (req, res) => {
    const { sportID, workoutName, workoutDescription } = req.body;
    try {
        const [workouts] = await db.query("INSERT INTO workouts (sport_id, workout_name, workout_description) VALUES (?, ?, ?)", [sportID, workoutName, workoutDescription]);
        return res.json(workouts);
    }
    catch (err) {
        return res.json(err);
    }
};

export const getDefaultWorkouts = async (req, res) => {
    const { sportID } = req.params;
    try {
        const [workouts] = await db.query(
            "SELECT * FROM workouts_defaults WHERE sport_id = ?",
            [sportID]
        );
        return res.json(Array.isArray(workouts) ? workouts : []);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};