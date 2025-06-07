const db = require('../config/db');
const bcrypt = require('bcrypt');
const { logActivity } = require('../controllers/adminSettingsController'); 

exports.login = (req, res) => {
  const { username, password, role } = req.body;

  const query = `SELECT id, full_name, email, username, password, role 
                 FROM users 
                 WHERE username = ? AND role = ? 
                 LIMIT 1`;

  db.query(query, [username, role], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials or role' });
    }

    const user = results[0];

    // Compare password with bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials or role' });
      }

      // Log login activity
      logActivity(user.username, user.role, 'Logged in');

      return res.status(200).json({ message: `${role} login successful`, role: user.role, user });
    });
  });
};
exports.register = (req, res) => {
  const { username, password } = req.body;

  // Hash password before saving
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Server error' });
        }

        // Log registration activity with default role "user"
        logActivity(username, 'user', 'Registered');

        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
};
