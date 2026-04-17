require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// 🔍 DEBUG ENV (REMOVE LATER IF WORKING)
console.log("===== ENV CHECK =====");
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD);
console.log("DB_NAME =", process.env.DB_NAME);
console.log("DB_PORT =", process.env.DB_PORT);
console.log("=====================");

// DB CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:");
    console.error(err.code);
    console.error(err.message);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is running");
});

// START SERVER
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});