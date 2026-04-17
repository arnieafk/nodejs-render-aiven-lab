require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// =====================
// DB CONNECTION
// =====================
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

// safer connection logging
db.connect((err) => {
  if (err) {
    console.error("❌ DB CONNECTION FAILED");
    console.error(err.code);
    console.error(err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// =====================
// HOME ROUTE
// =====================
app.get("/", (req, res) => {
  console.log("GET / HIT");

  db.query("SELECT * FROM students", (err, results) => {
    
    // ❗ IMPORTANT FIX: prevent crash
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).send(`
        <h1>Database Error</h1>
        <pre>${err.message}</pre>
      `);
    }

    if (!results) results = [];

    let html = `
    <html>
    <head>
      <title>Student CRUD</title>
      <style>
        body { font-family: Arial; background:#f0f2f5; margin:0; }
        .header { background:#1877f2; color:white; padding:15px; font-size:20px; }
        .container { width:70%; margin:auto; margin-top:20px; }
        .card { background:white; padding:15px; margin-bottom:15px; border-radius:8px; }
        input { width:95%; padding:10px; margin:5px 0; }
        button { background:#1877f2; color:white; border:none; padding:10px 15px; cursor:pointer; }
        a { margin-right:10px; }
      </style>
    </head>
    <body>

    <div class="header">Student CRUD Dashboard</div>

    <div class="container">

      <div class="card">
        <h3>Add Student</h3>
        <form method="POST" action="/add">
          <input name="stud_name" placeholder="Name" required>
          <input name="stud_address" placeholder="Address" required>
          <input name="age" placeholder="Age" required>
          <button type="submit">Add</button>
        </form>
      </div>

      <div class="card">
        <h3>Student List</h3>
    `;

    results.forEach((s) => {
      html += `
        <div>
          <b>${s.stud_name}</b><br>
          ${s.stud_address} | ${s.age}<br>
          <a href="/edit/${s.stud_id}">Edit</a>
          <a href="/delete/${s.stud_id}">Delete</a>
          <hr>
        </div>
      `;
    });

    html += `
      </div>
    </div>
    </body>
    </html>
    `;

    res.send(html);
  });
});

// =====================
// CREATE
// =====================
app.post("/add", (req, res) => {
  const { stud_name, stud_address, age } = req.body;

  db.query(
    "INSERT INTO students (stud_name, stud_address, age) VALUES (?, ?, ?)",
    [stud_name, stud_address, age],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      res.redirect("/");
    }
  );
});

// =====================
// EDIT
// =====================
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM students WHERE stud_id=?", [id], (err, results) => {
    if (err) return res.send(err.message);

    const s = results[0];

    if (!s) return res.send("Student not found");

    res.send(`
      <html>
      <body style="font-family:Arial;background:#f0f2f5;">
        <div style="width:40%;margin:auto;margin-top:80px;background:white;padding:20px;border-radius:10px;">
          <h2>Edit Student</h2>

          <form method="POST" action="/update/${id}">
            <input name="stud_name" value="${s.stud_name}" style="width:100%;padding:10px;margin:5px 0;">
            <input name="stud_address" value="${s.stud_address}" style="width:100%;padding:10px;margin:5px 0;">
            <input name="age" value="${s.age}" style="width:100%;padding:10px;margin:5px 0;">
            <button>Update</button>
          </form>

        </div>
      </body>
      </html>
    `);
  });
});

// =====================
// UPDATE
// =====================
app.post("/update/:id", (req, res) => {
  const id = req.params.id;
  const { stud_name, stud_address, age } = req.body;

  db.query(
    "UPDATE students SET stud_name=?, stud_address=?, age=? WHERE stud_id=?",
    [stud_name, stud_address, age, id],
    (err) => {
      if (err) return res.send(err.message);
      res.redirect("/");
    }
  );
});

// =====================
// DELETE
// =====================
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM students WHERE stud_id=?",
    [id],
    (err) => {
      if (err) return res.send(err.message);
      res.redirect("/");
    }
  );
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});