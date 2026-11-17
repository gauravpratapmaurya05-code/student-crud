require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { init } = require("./db");
const studentRoutes = require("./routes/students");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 5000;

init()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => console.log(`API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Cannot connect to the database:", err.message);
    process.exit(1);
  });
