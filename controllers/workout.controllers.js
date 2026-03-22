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

export const updateWorkoutName = async (req, res) => {
    const { workoutID } = req.params;
    const { workoutName } = req.body;
    try {
        await db.query(
            `UPDATE workouts SET workout_name = ? WHERE workout_id = ?`,
            [workoutName, workoutID]
        );
        return res.status(200).json({ message: 'Workout updated' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const addWorkoutNonDefault = async (req, res) => {
    const { sportID, workoutName, workoutDescription } = req.body;
    const userID = req.user.id;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [workout] = await conn.query(
            'INSERT INTO workouts (sport_id, workout_name ,workout_description) VALUES (?, ?, ?)',
            [sportID, workoutName, workoutDescription]
        );
        const workoutID = workout.insertId;
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

export const deleteWorkout = async (req, res) => {
    const { workoutID } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        // Delete all exercises for this workout
        await conn.query(
            'DELETE FROM exercises WHERE day_id IN (SELECT day_id FROM workouts_days WHERE workout_id = ?)',
            [workoutID]
        );
        // Delete all days for this workout
        await conn.query(
            'DELETE FROM workouts_days WHERE workout_id = ?',
            [workoutID]
        );
        // Delete the workout
        await conn.query(
            'DELETE FROM workouts WHERE workout_id = ?',
            [workoutID]
        );
        await conn.commit();
        return res.status(200).json({ message: 'Workout deleted successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Error deleting workout:', error);
        return res.status(500).json({ message: 'Failed to delete workout' });
    } finally {
        conn.release();
    }
};

export const createSession = async (req, res) => {
    const { workoutID, startDate, endDate } = req.body;
    const userID = req.user.id;
    const conn = await db.getConnection();
    const toMySQLDate = (isoString) => new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');

    try {
        await conn.beginTransaction();
        const [workout] = await conn.query(
            'SELECT workout_name FROM workouts WHERE workout_id = ?',
            [workoutID]
        );
        const workoutName = workout[0].workout_name;
        // 1. Create the session
        const [session] = await conn.query(
            'INSERT INTO workout_session (user_id, workout_id, started_at, end_at, statue , workout_name) VALUES (?, ?, ?, ?, ?, ?)',
            [userID, workoutID, toMySQLDate(startDate), toMySQLDate(endDate), 'progress', workoutName]
        );
        const sessionID = session.insertId;

        // 2. Get all days belonging to this workout
        const [days] = await conn.query(
            'SELECT * FROM workouts_days WHERE workout_id = ?',
            [workoutID]
        );
        console.log('Days found:', days.length, days);

        for (const day of days) {
            // 3. Insert a session-day row linking this session to each day
            const [sessionDay] = await conn.query(
                'INSERT INTO workout_session_days (session_id ,day_id, day_name) VALUES (?, ?, ?)',
                [sessionID, day.day_id, day.day_name]
            );
            const dayID = sessionDay.insertId;

            // 4. Get all exercises for this day
            const [exercises] = await conn.query(
                'SELECT * FROM exercises WHERE day_id = ?',
                [day.day_id]
            );
            console.log(`Exercises for day ${day.day_id}:`, exercises.length, exercises);

            // 5. Create a blank log entry for each exercise
            for (const exercise of exercises) {
                await conn.query(
                    'INSERT INTO exercice_logs (day_id, exercise_id, ex_name, sets_completed, reps_completed, weight_kg, rest_sec) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [dayID, exercise.id, exercise.ex_name, exercise.sets, exercise.reps, exercise.weight, exercise.rest]
                );
            }
        }

        await conn.commit();
        res.status(201).json({ message: 'Session created', sessionID, workoutID });

    } catch (error) {
        await conn.rollback();
        console.error('Error creating session:', error);
        return res.status(500).json({ message: 'Failed to create session' });
    } finally {
        conn.release();
    }
};


export const getSessions = async (req, res) => {

    const { userID } = req.params;
    const conn = await db.getConnection();
    try {
        const [sessions] = await conn.query(
            `SELECT ws.*, 
            (SELECT COUNT(*) FROM workouts_days WHERE workout_id = ws.workout_id) AS days_per_week
            FROM workout_session ws
            WHERE ws.user_id = ? AND ws.is_deleted = 0 ORDER BY ws.started_at DESC`,
            [userID]
        );
        return res.status(200).json(sessions);
    }
    catch (error) {
        console.error('Error getting sessions:', error);
        return res.status(500).json({ message: 'Failed to get sessions' });
    } finally {
        conn.release();
    }

}

export const completeSession = async (req, res) => {
    const { sessionID } = req.params;
    const conn = await db.getConnection();
    try {
        const [result] = await conn.query(
            `UPDATE workout_session
             SET statue = 'complete'
             WHERE id = ? AND is_deleted = 0`,
            [sessionID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        return res.status(200).json({ message: 'Session completed successfully' });
    } catch (error) {
        console.error('Error completing session:', error);
        return res.status(500).json({ message: 'Failed to complete session' });
    } finally {
        conn.release();
    }
}