const db = require('../config/db');

// Update Admin Password Securely
exports.updateAdminPassword = (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  const findQuery = 'SELECT * FROM users WHERE username = ? AND role = "admin"';
  const updateQuery = 'UPDATE users SET password = ? WHERE username = ?';

  db.query(findQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    const admin = results[0];

    // Compare current password with hashed one
    bcrypt.compare(currentPassword, admin.password, (compareErr, isMatch) => {
      if (compareErr) return res.status(500).json({ message: 'Error verifying password' });

      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password' });
      }

      // Hash the new password
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) return res.status(500).json({ message: 'Error hashing new password' });

        // Update password in DB
        db.query(updateQuery, [hashedPassword, username], (updateErr) => {
          if (updateErr) return res.status(500).json({ message: 'Failed to update password' });

          return res.json({ message: 'Password updated successfully' });
        });
      });
    });
  });
};

//log activity
exports.logActivity = (username, role, action) => {
  const query = 'INSERT INTO activity_logs (username, role, action) VALUES (?, ?, ?)';
  db.query(query, [username, role, action], (err) => {
    if (err) console.error('Failed to log activity:', err);
  });
};

//clear log activity
exports.clearActivityLogs = (req, res) => {
  const query = 'DELETE FROM activity_logs';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Failed to clear activity logs:', err);
      return res.status(500).json({ message: 'Failed to clear logs' });
    }
    return res.status(200).json({ message: 'Activity logs cleared successfully' });
  });
};




