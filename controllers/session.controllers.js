import db from '../db.js'

export const getSessionDays = async (req, res) => {
    const { sessionId } = req.params;

    const [days] = await db.query('SELECT * FROM workout_session_days WHERE session_id =  ? ', [sessionId])
    if (days.length > 0) {
        res.json(days)
    } else {
        res.json({ message: "No days found" })
    }

}

export const getSessionExercises = async (req, res) => {
    const { dayID } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT
                exercise_id,
                ex_name,
                sets_completed,
                reps_completed,
                weight_kg,
                rest_sec,
                created_at
            FROM exercice_logs
            WHERE day_id = ? AND is_deleted = 0
            ORDER BY exercise_id ASC, created_at DESC, id DESC`,
            [dayID]
        );

        if (!rows.length) {
            return res.status(200).json([]);
        }

        const byExercise = new Map();
        for (const row of rows) {
            const exKey = String(row.exercise_id);
            if (!byExercise.has(exKey)) {
                byExercise.set(exKey, {
                    exercise_id: row.exercise_id,
                    ex_name: row.ex_name,
                    latest: {
                        sets: row.sets_completed,
                        reps: row.reps_completed,
                        weight: row.weight_kg,
                        rest: row.rest_sec,
                        created_at: row.created_at,
                    },
                    logs: [],
                });
            }
            byExercise.get(exKey).logs.push({
                sets: row.sets_completed,
                reps: row.reps_completed,
                weight: row.weight_kg,
                rest: row.rest_sec,
                created_at: row.created_at,
            });
        }

        return res.status(200).json(Array.from(byExercise.values()));
    } catch (error) {
        console.error("Error fetching session exercises:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const createExerciseLog = async (req, res) => {
    const { dayID } = req.params;
    const { exercise_id, ex_name, sets, reps, weight, rest } = req.body;

    if (!exercise_id || !ex_name) {
        return res.status(400).json({ message: "exercise_id and ex_name are required" });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO exercice_logs (
                day_id,
                exercise_id,
                ex_name,
                sets_completed,
                reps_completed,
                weight_kg,
                rest_sec
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                dayID,
                exercise_id,
                ex_name,
                sets || 0,
                reps || 0,
                weight || 0,
                rest || 0
            ]
        );

        return res.status(201).json({ id: result.insertId, message: "Log saved" });
    } catch (error) {
        console.error("Error creating exercise log:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}