import db from '../db.js';

export const getDays = async (req, res) => {
    const { workoutID } = req.params;
    try {
        const [days] = await db.query(
            `SELECT * FROM workouts_days WHERE workout_id = ?`,
            [workoutID]
        );

        return res.status(200).json(days);

    } catch (error) {
        console.error("Error fetching days:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addDays = async (req, res) => {
    const { workoutID } = req.params;
    const { dayName } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO workouts_days (workout_id, day_name) VALUES (?, ?)`,
            [workoutID, dayName]
        );
        // BUG FIX: res.json() only accepts ONE argument.
        // Before: res.status(200).json(days, dayId)  ← dayId was silently dropped
        // Now: return both in a single object so the frontend can read dayId
        return res.status(200).json({ dayId: result.insertId });
    } catch (error) {
        console.error("Error adding day:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteDay = async (req, res) => {
    const { dayID } = req.params;
    try {
        await db.query(
            'DELETE FROM exercises WHERE day_id = ?',
            [dayID]
        );
        const [result] = await db.query(
            'DELETE FROM workouts_days WHERE day_id = ?',
            [dayID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Day not found' });
        }
        return res.status(200).json({ message: 'Day deleted successfully' });
    } catch (error) {
        console.error('Error deleting day:', error);
        return res.status(500).json({ message: 'Failed to delete day' });
    }
};

export const addDefaultDays = async (req, res) => {
    const { workoutID } = req.params;
    const { dayName } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO workouts_days (workout_id, day_name) VALUES (?, ?)`,
            [workoutID, dayName]
        );
        // BUG FIX: res.json() only accepts ONE argument.
        // Before: res.status(200).json(days, dayId)  ← dayId was silently dropped
        // Now: return both in a single object so the frontend can read dayId
        return res.status(200).json({ dayId: result.insertId });
    } catch (error) {
        console.error("Error adding day:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};          