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

export const saveWorkout = async (req, res) => {
    const { workoutName, days } = req.body;
    const sportID = parseInt(req.body.sportID, 10)
    // BUG FIX: userID was declared but never used in queries — kept for future use
    const userID = req.user.id;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // BUG FIX: INSERT column order was (workout_name, sport_id) but VALUES were (sportID, workoutName) — swapped
        const [workout] = await conn.query(
            'INSERT INTO workouts (sport_id, workout_name) VALUES (?, ?)',
            [sportID, workoutName]
        );
        const workoutID = workout.insertId;

        for (const day of days) {
            // BUG FIX: dayID was read from day.insertId (undefined) — must use the insertId of the day INSERT
            const [dayResult] = await conn.query(
                'INSERT INTO workouts_days (workout_id, day_name) VALUES (?, ?)',
                [workoutID, day.day_name]
            );
            const newDayID = dayResult.insertId; // BUG FIX: was `day.insertId` which is always undefined

            for (const ex of day.exercises) {
                // BUG FIX: when isFromDB is false, the code was inserting into `exercises` TWICE
                // (once as "new exercise", then again as "exercise details").
                // Fix: insert once with all fields, skip duplicate insert.
                if (!ex.isFromDB) {
                    await conn.query(
                        'INSERT INTO exercises (ex_name, day_id, sets, reps, weight, rest) VALUES (?, ?, ?, ?, ?, ?)',
                        [ex.ex_name, newDayID, ex.sets, ex.reps, ex.weight, ex.rest]
                    );
                } else {
                    // Existing DB exercise — just store the workout details
                    await conn.query(
                        'INSERT INTO exercises (ex_name, day_id, sets, reps, weight, rest) VALUES (?, ?, ?, ?, ?, ?)',
                        [ex.ex_name, newDayID, ex.sets, ex.reps, ex.weight, ex.rest]
                    );
                }
            }
        }

        await conn.commit();
        res.status(201).json({ message: 'Workout saved', workoutID });

    } catch (error) {
        await conn.rollback();
        console.error('Error saving workout:', error);
        res.status(500).json({ message: 'Failed to save workout' });
    } finally {
        conn.release();
    }
};



















