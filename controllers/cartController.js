const mysql = require("mysql"); // ✅ Added missing JWT import
const jwt = require("jsonwebtoken"); // ✅ Added missing JWT import

const SECRET_KEY = process.env.JWT_SECRET;

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

const addToCart = (req, res) => {
  const { course_id, user_id, quantity } = req.body;

  if (!course_id || !user_id) {
    return res
      .status(400)
      .json({ error: "course_id and user_id are required" });
  }

  // Check if the course is already in the cart
  const checkSql = `SELECT * FROM cart WHERE course_id = ? AND user_id = ?`;
  db.query(checkSql, [course_id, user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length > 0) {
      // Course is already in the cart, update quantity
      // const updateSql = `UPDATE cart SET quantity = quantity + ? WHERE course_id = ? AND user_id = ?`;
      // db.query(updateSql, [quantity || 1, course_id, user_id], (err) => {
      //   if (err) {
      //     return res.status(500).json({ error: "Failed to update cart" });
      //   }
      res.json({ message: "This Course is already in cart" });
      // });
    } else {
      // Insert new course into the cart
      const insertSql = `INSERT INTO cart (course_id, user_id, quantity) VALUES (?, ?, ?)`;
      db.query(
        insertSql,
        [course_id, user_id, quantity || 1],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Failed to add course to cart" });
          }
          res.json({
            message: "Course added to cart successfully",
            cart_id: result.insertId,
          });
        }
      );
    }
  });
};

const getAllCartItems = (req, res) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = user; // Store user data in request object

    const sql = `
      SELECT 
        cart.id AS cart_id, 
        courses.id AS course_id, 
        courses.name, 
        courses.price,
        courses.description,
        courses.duration
      FROM cart 
      INNER JOIN courses ON cart.course_id = courses.id 
      WHERE cart.user_id = ?`;

    db.query(sql, [user?.user_id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }

      return res.status(200).json(results || []);
    });
  });
};

const removeFromCart = (req, res) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = user;

    const { cart_id } = req.params; // Get cart_id from request params
    if (!cart_id) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    const sql = `DELETE FROM cart WHERE id = ? AND user_id = ?`;

    db.query(sql, [cart_id, user.user_id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ error: "Failed to remove item from cart" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.status(200).json({ message: "Item removed from cart successfully" });
    });
  });
};

module.exports = { addToCart, getAllCartItems, removeFromCart };
