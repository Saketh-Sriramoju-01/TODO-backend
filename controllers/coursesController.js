const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

const getCourses = (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json(results);
  });
};

const getCoursesDetails = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM courses WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json(results[0]);
  });
};

module.exports = { getCourses, getCoursesDetails };
