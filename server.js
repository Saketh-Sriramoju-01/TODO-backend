const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql");
const cors = require("cors");

// Load environment variables
dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());

// ✅ OR, if you want to allow only specific origins:
app.use(
  cors({
    origin: "http://localhost:3001", // Replace with your frontend URL
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json()); // ✅ Middleware to parse JSON body

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MYSQL Connected.... ");
  }
});

app.use("/authentication", require("./routes/authRoute"));
app.use("/api/courses", require("./routes/coursesRoute"));
app.use("/api/cart", require("./routes/cartRoute"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server running on port ", port);
});
