const express = require("express");
const { pool } = require("../db");

const router = express.Router();

function validate({ name, age, roll_no }) {
  if (!name || !String(name).trim()) return "Name is required";
  if (!Number.isInteger(Number(age)) || Number(age) <= 0) return "Age must be a positive number";
  if (!roll_no || !String(roll_no).trim()) return "Roll no. is required";
  return null;
}

function handleError(e, res, fallback) {
  if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "That roll no. already exists" });
  console.error(e);
  res.status(500).json({ error: fallback });
}

// READ all
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    handleError(e, res, "Could not load students");
  }
});

// READ one
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (e) {
    handleError(e, res, "Could not load student");
  }
});

// CREATE
router.post("/", async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, age, roll_no } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO students (name, age, roll_no) VALUES (?, ?, ?)",
      [name.trim(), Number(age), String(roll_no).trim()]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), age: Number(age), roll_no: String(roll_no).trim() });
  } catch (e) {
    handleError(e, res, "Could not save student");
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, age, roll_no } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE students SET name = ?, age = ?, roll_no = ? WHERE id = ?",
      [name.trim(), Number(age), String(roll_no).trim(), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ id: Number(req.params.id), name: name.trim(), age: Number(age), roll_no: String(roll_no).trim() });
  } catch (e) {
    handleError(e, res, "Could not update student");
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM students WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (e) {
    handleError(e, res, "Could not delete student");
  }
});

module.exports = router;
