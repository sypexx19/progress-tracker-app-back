import db from './db.js';
import fs from 'fs';

async function dumpSchema() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        const schema = {};

        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
            schema[tableName] = columns.map(c => ({ Field: c.Field, Type: c.Type }));
        }

        fs.writeFileSync('db_schema.json', JSON.stringify(schema, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

dumpSchema();
