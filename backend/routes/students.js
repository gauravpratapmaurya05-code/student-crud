const express = require("express");
const db = require("../../database/db");

const router = express.Router();

function validate({ name, age, roll_no }) {
  if (!name || !String(name).trim()) return "Name is required";
  if (!Number.isInteger(Number(age)) || Number(age) <= 0) return "Age must be a positive number";
  if (!roll_no || !String(roll_no).trim()) return "Roll no. is required";
  return null;
}

// READ all
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM students ORDER BY id DESC").all();
  res.json(rows);
});

// READ one
router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Student not found" });
  res.json(row);
});

// CREATE
router.post("/", (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, age, roll_no } = req.body;
  try {
    const info = db
      .prepare("INSERT INTO students (name, age, roll_no) VALUES (?, ?, ?)")
      .run(name.trim(), Number(age), String(roll_no).trim());
    res.status(201).json({ id: Number(info.lastInsertRowid), name: name.trim(), age: Number(age), roll_no: String(roll_no).trim() });
  } catch (e) {
    if (String(e.message).includes("UNIQUE"))
      return res.status(409).json({ error: "That roll no. already exists" });
    res.status(500).json({ error: "Could not save student" });
  }
});

// UPDATE
router.put("/:id", (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, age, roll_no } = req.body;
  try {
    const info = db
      .prepare("UPDATE students SET name = ?, age = ?, roll_no = ? WHERE id = ?")
      .run(name.trim(), Number(age), String(roll_no).trim(), req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ id: Number(req.params.id), name: name.trim(), age: Number(age), roll_no: String(roll_no).trim() });
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE")
      return res.status(409).json({ error: "That roll no. already exists" });
    res.status(500).json({ error: "Could not update student" });
  }
});

// DELETE
router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Student not found" });
  res.json({ message: "Student deleted" });
});

module.exports = router;
