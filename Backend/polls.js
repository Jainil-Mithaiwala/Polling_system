const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "polling_system",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");
});

// Create Poll
app.post("/api/create-poll", (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || options.length < 2) {
    return res
      .status(400)
      .json({
        error:
          "Invalid input. Please provide a question and at least two options.",
      });
  }

  const optionsString = JSON.stringify(options);

  const query = "INSERT INTO polls (question, options) VALUES (?, ?)";
  const values = [question, optionsString];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting poll:", err);
      return res
        .status(500)
        .json({ error: "Failed to create poll. Please try again." });
    }

    res.status(200).json({ message: "Poll created successfully." });
  });
});

// Read Polls
app.get("/api/polls", (req, res) => {
  const query = "SELECT * FROM polls";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching polls:", err);
      return res.status(500).json({ error: "Failed to fetch polls." });
    }

    // Parse options JSON
    results.forEach((poll) => {
      poll.options = JSON.parse(poll.options);
    });

    res.status(200).json(results);
  });
});

// Update Poll
app.put("/api/update-poll/:id", (req, res) => {
  const { id } = req.params;
  const { question, options } = req.body;

  if (!question || !options || options.length < 2) {
    return res
      .status(400)
      .json({
        error:
          "Invalid input. Please provide a question and at least two options.",
      });
  }

  const optionsString = JSON.stringify(options);

  const query = "UPDATE polls SET question = ?, options = ? WHERE id = ?";
  const values = [question, optionsString, id];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating poll:", err);
      return res.status(500).json({ error: "Failed to update poll." });
    }

    res.status(200).json({ message: "Poll updated successfully." });
  });
});

// Delete Poll
app.delete("/api/delete-poll/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM polls WHERE id = ?";
  const values = [id];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error deleting poll:", err);
      return res.status(500).json({ error: "Failed to delete poll." });
    }

    res.status(200).json({ message: "Poll deleted successfully." });
  });
});

// Example backend code (Node.js/Express)
app.post("/api/polls/:pollId/vote", async (req, res) => {
  const { pollId } = req.params;
  const { optionIndex } = req.body;

  // Validate optionIndex
  if (typeof optionIndex !== "number" || optionIndex < 0) {
    return res.status(400).send({ error: "Invalid optionIndex" });
  }

  try {
    // Fetch the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    // Check if optionIndex is within the range
    if (optionIndex >= poll.options.length) {
      return res.status(400).send({ error: "Invalid optionIndex" });
    }

    // Increment the vote count
    poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
    await poll.save();

    res.send(poll);
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).send({ error: "Failed to cast vote" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
