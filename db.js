import mysql from "mysql2/promise";

const db = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"251925",
    database:"progress",
});

export default db ;
