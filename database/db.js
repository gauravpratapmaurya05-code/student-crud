const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "students.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    age     INTEGER NOT NULL,
    roll_no TEXT    NOT NULL UNIQUE
  )
`);

module.exports = db;