require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "studentdb",
  waitForConnections: true,
  connectionLimit: 10,
});

// Creates the table if it does not exist yet
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id      INT AUTO_INCREMENT PRIMARY KEY,
      name    VARCHAR(100) NOT NULL,
      age     INT          NOT NULL,
      roll_no VARCHAR(50)  NOT NULL UNIQUE
    )
  `);
}

module.exports = { pool, init };
