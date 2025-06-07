const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND role = "admin"';

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Unauthorized: Admin not found' });
    }

    const admin = results[0];

    // Compare the hashed password using bcrypt
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Unauthorized: Incorrect password' });
      }

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        role: 'admin',
        user: admin
      });
    });
  });
};
