import db from './db.js';

async function checkSchema() {
    try {
        const [workoutsCols] = await db.query('SHOW COLUMNS FROM workouts');
        console.log('--- workouts ---');
        console.table(workoutsCols);

        const [exercisesCols] = await db.query('SHOW COLUMNS FROM exercises');
        console.log('--- exercises ---');
        console.table(exercisesCols);

        const [weCols] = await db.query('SHOW COLUMNS FROM workout_exercises');
        console.log('--- workout_exercises ---');
        console.table(weCols);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkSchema();
