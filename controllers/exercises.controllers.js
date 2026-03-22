import db from '../db.js'

export const getExercises = async (req, res) => {
    const { dayID } = req.params;
    try {
        // First check the user's saved exercises table
        const [exercises] = await db.query(
            `SELECT * FROM exercises WHERE day_id = ?`,
            [dayID]
        );

        // If found, return them
        if (exercises.length > 0) {
            return res.status(200).json(exercises);
        }

        // Otherwise fall back to default exercises
        const [defaultExercises] = await db.query(
            `SELECT * FROM default_exercieses WHERE day_id = ?`,
            [dayID]
        );

        return res.status(200).json(defaultExercises);

    } catch (error) {
        console.error("Error fetching exercises:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Add a single exercise to a day — called from AddEx "Save" button
export const addExercise = async (req, res) => {
    const { dayID, ex_name, sets, reps, weight, rest } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO exercises (day_id, ex_name, sets, reps, weight, rest) VALUES (?, ?, ?, ?, ?, ?)`,
            [dayID, ex_name, sets, reps, weight, rest]
        );
        return res.status(201).json({ id: result.insertId, message: "Exercise added" });
    } catch (error) {
        console.error("Error adding exercise:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteEx = async (req, res) => {
    const { id } = req.params;
    try {
        const [exercises] = await db.query(
            `DELETE FROM exercises WHERE id = ?`,
            [id]
        );
        return res.status(200).json(exercises);
    } catch (error) {
        console.error("Error deleting exercises:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getType = async (req, res) => {
    try {
        const [types] = await db.query(
            `SELECT * FROM e_types`
        );
        return res.status(200).json(types);
    } catch (error) {
        console.error("Error fetching types:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getDefaultExercises = async (req, res) => {
    const { typeID } = req.params;
    console.log('typeID received:', typeID);
    try {
        const [exercises] = await db.query(
            `SELECT * FROM all_exercises WHERE e_type = ?`,
            [typeID]
        );
        console.log('exercises found:', exercises);
        return res.status(200).json(exercises);
    } catch (error) {
        console.error("Error fetching exercises:", error.message);
        res.status(500).json({ message: error.message });
    }
}

export const addDefaultExercises = async (req, res) => {
    const { typeID , ex_name } = req.body;
    try {   
        const [result] = await db.query(
            `INSERT INTO all_exercises ( e_name , e_type ) VALUES (?, ?)`,
            [ex_name, typeID]
        );
        return res.status(201).json({ id: result.insertId, message: "Exercise added" });
    } catch (error) {
        console.error("Error adding exercise:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}