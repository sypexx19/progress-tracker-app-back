import db from '../db.js'

export const getExercises = async (req, res) => {
    const { dayID } = req.params;
    try {
        const [exercises] = await db.query(`SELECT * FROM default_exercieses WHERE day_id = ?`, [dayID]);
        res.status(200).json(exercises);
    } catch (error) {
        console.error("Error fetching exercises:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}