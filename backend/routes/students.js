const express = require("express");
const multer = require("multer");
const { pool } = require("../db");
const { uploadFile, getFileUrl, deleteFile } = require("../s3");

const router = express.Router();

// ---------- file upload settings ----------
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) =>
    ALLOWED_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PNG, JPG, GIF, PDF or DOCX files are allowed")),
});

function uploadSingle(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 5 MB)" : err.message;
      return res.status(400).json({ error: msg });
    }
    next();
  });
}

// ---------- helpers ----------
function validate({ name, age, roll_no } = {}) {
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

// Replace the internal S3 key with a temporary download link
async function withUrl(row) {
  const { file_key, ...rest } = row;
  if (file_key) rest.file_url = await getFileUrl(file_key);
  return rest;
}

// ---------- routes ----------

// READ all
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(await Promise.all(rows.map(withUrl)));
  } catch (e) {
    handleError(e, res, "Could not load students");
  }
});

// READ one
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(await withUrl(rows[0]));
  } catch (e) {
    handleError(e, res, "Could not load student");
  }
});

// CREATE (multipart form: name, age, roll_no, optional file)
router.post("/", uploadSingle, async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, age, roll_no } = req.body;

  let fileKey = null;
  let fileName = null;
  try {
    if (req.file) {
      fileKey = await uploadFile(req.file);
      fileName = req.file.originalname;
    }
    const [result] = await pool.query(
      "INSERT INTO students (name, age, roll_no, file_key, file_name) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), Number(age), String(roll_no).trim(), fileKey, fileName]
    );
    res.status(201).json(
      await withUrl({
        id: result.insertId,
        name: name.trim(),
        age: Number(age),
        roll_no: String(roll_no).trim(),
        file_key: fileKey,
        file_name: fileName,
      })
    );
  } catch (e) {
    if (fileKey) await deleteFile(fileKey); // don't leave an orphan file in S3
    handleError(e, res, "Could not save student");
  }
});

// UPDATE (a new file replaces the old one; no file = keep the old one)
router.put("/:id", uploadSingle, async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { name, age, roll_no } = req.body;

  let newKey = null;
  try {
    const [existing] = await pool.query("SELECT file_key FROM students WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: "Student not found" });

    const sets = ["name = ?", "age = ?", "roll_no = ?"];
    const values = [name.trim(), Number(age), String(roll_no).trim()];
    if (req.file) {
      newKey = await uploadFile(req.file);
      sets.push("file_key = ?", "file_name = ?");
      values.push(newKey, req.file.originalname);
    }
    values.push(req.params.id);

    await pool.query(`UPDATE students SET ${sets.join(", ")} WHERE id = ?`, values);
    if (newKey && existing[0].file_key) await deleteFile(existing[0].file_key);

    const [fresh] = await pool.query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    res.json(await withUrl(fresh[0]));
  } catch (e) {
    if (newKey) await deleteFile(newKey);
    handleError(e, res, "Could not update student");
  }
});

// DELETE (also removes the file from S3)
router.delete("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT file_key FROM students WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    await pool.query("DELETE FROM students WHERE id = ?", [req.params.id]);
    if (rows[0].file_key) await deleteFile(rows[0].file_key);
    res.json({ message: "Student deleted" });
  } catch (e) {
    handleError(e, res, "Could not delete student");
  }
});

module.exports = router;
