import pool from './db.js';
async function drop() {
  try {
    await pool.query('ALTER TABLE workouts DROP COLUMN default_workout_id').catch(e => console.log(e.message));
    await pool.query('DROP TABLE IF EXISTS default_exercieses').catch(e => console.log(e.message));
    await pool.query('DROP TABLE IF EXISTS default_workouts_days').catch(e => console.log(e.message));
    await pool.query('DROP TABLE IF EXISTS workouts_defaults').catch(e => console.log(e.message));
    console.log('Successfully dropped default tables');
  } catch(e) { console.error('Error dropping tables', e); }
  process.exit(0);
}
drop();
