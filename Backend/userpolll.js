const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5002;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "polling_system",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");
});

app.get("/api/polls", (req, res) => {
  const query = "SELECT * FROM polls";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching polls:", err);
      return res.status(500).json({ error: "Failed to fetch polls." });
    }

    results.forEach((poll) => {
      poll.options = JSON.parse(poll.options);
    });

    res.status(200).json(results);
  });
});

app.post('/api/vote', (req, res) => {
    const { pollId, optionIndex } = req.body;

    if (typeof pollId !== 'number' || typeof optionIndex !== 'number') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const query = 'UPDATE polls SET votes = JSON_SET(votes, CONCAT("$[", ? ,"]"), JSON_EXTRACT(votes, CONCAT("$[", ? ,"]")) + 1) WHERE id = ?';
    
    db.query(query, [optionIndex, optionIndex, pollId], (err, results) => {
        if (err) {
            console.error('Error voting in poll:', err);
            return res.status(500).json({ error: 'Failed to register vote.' });
        }

        res.status(200).json({ message: 'Vote registered successfully' });
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
