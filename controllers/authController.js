const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    try {
      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.id, email: user.email, user_name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Logged in successfully",
        token,
        token_type: "Bearer",
      });
    } catch (error) {
      console.error("Error during password comparison:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

const logout = (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  // Store token in Redis with expiration

  res.json({ message: "Logged out successfully" });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user already exists
    const sqlCheck = "SELECT * FROM users WHERE email = ?";
    db.query(sqlCheck, [email], async (err, results) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const sqlInsert =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      db.query(sqlInsert, [name, email, hashedPassword], (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Database error", error: err });

        // Generate JWT Token
        const token = jwt.sign(
          { id: result.insertId, email },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        res.status(201).json({ message: "Registered successful", token });
      });
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, logout };
