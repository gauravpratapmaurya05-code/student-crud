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
      roll_no VARCHAR(50)  NOT NULL UNIQUE,
      file_key  VARCHAR(512) NULL,
      file_name VARCHAR(255) NULL
    )
  `);

  // For tables created before file upload existed: add the new columns once
  try {
    await pool.query(
      "ALTER TABLE students ADD COLUMN file_key VARCHAR(512) NULL, ADD COLUMN file_name VARCHAR(255) NULL"
    );
  } catch (e) {
    if (e.code !== "ER_DUP_FIELDNAME") throw e;
  }
}

module.exports = { pool, init };
