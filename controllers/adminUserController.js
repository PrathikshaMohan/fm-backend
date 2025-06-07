
const db = require("../config/db");

exports.getAllUsers = (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json(results);
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to delete user" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { full_name, email, username, role } = req.body;
  db.query(
    "UPDATE users SET full_name = ?, email = ?, username = ?, role = ? WHERE id = ?",
    [full_name, email, username, role, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      res.status(200).json({ message: "User updated successfully" });
    }
  );
};
