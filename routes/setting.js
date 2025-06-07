const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Simulate authenticated user (you should use real auth in production)
router.use((req, res, next) => {
  req.userId = 1; // mock user id, replace with session/JWT user ID
  next();
});

// GET farmer profile
router.get("/profile", (req, res) => {
  const userId = req.userId;

  const query = "SELECT id, full_name, email, role FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching profile:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    if (results[0].role !== "farmer") return res.status(403).json({ message: "Access denied" });

    res.json(results[0]);
  });
});

// PUT update profile
router.put("/update-profile", (req, res) => {
  const userId = req.userId;
  const { name, email, password } = req.body;

  const getRoleQuery = "SELECT role FROM users WHERE id = ?";
  db.query(getRoleQuery, [userId], (err, result) => {
    if (err) {
      console.error("Error checking role:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) return res.status(404).json({ message: "User not found" });
    if (result[0].role !== "farmer") return res.status(403).json({ message: "Access denied" });

    let updateQuery = "UPDATE users SET full_name = ?, email = ?";
    const values = [name, email];

    if (password) {
      updateQuery += ", password = ?";
      values.push(password);
    }

    updateQuery += " WHERE id = ?";
    values.push(userId);

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      res.json({ message: "Profile updated successfully" });
    });
  });
});

module.exports = router;
