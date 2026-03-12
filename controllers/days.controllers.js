import db from '../db.js';

export const getDays = async (req, res) => {
    const { workoutID } = req.params;
    try {
        const [days] = await db.query(
            `SELECT * FROM workouts_days WHERE workout_id = ?`,
            [workoutID]
        );

        if (days.length > 0) {
            return res.status(200).json(days);
        }

        const [workout] = await db.query(
            `SELECT default_workout_id FROM workouts WHERE workout_id = ?`,
            [workoutID]
        );

        if (!workout[0]?.default_workout_id) {
            return res.status(404).json({ message: "No default workout linked" });
        }

        const defaultWorkoutID = workout[0].default_workout_id;

        const [defaultDays] = await db.query(
            `SELECT * FROM default_workouts_days WHERE workout_id = ?`,
            [defaultWorkoutID]
        );

        if (defaultDays.length === 0) {
            return res.status(404).json({ message: "No default days found" });
        }

        const values = defaultDays.map(day => [workoutID, day.day_name]);
        await db.query(
            `INSERT INTO workouts_days (workout_id, day_name) VALUES ?`,
            [values]
        );

        const [insertedDays] = await db.query(
            `SELECT * FROM workouts_days WHERE workout_id = ?`,
            [workoutID]
        );

        return res.status(200).json(insertedDays);

    } catch (error) {
        console.error("Error fetching days:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};