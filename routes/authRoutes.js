const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { logActivity } = require('../controllers/adminSettingsController'); 

// Signup route
router.post('/signup', (req, res) => {
  const { full_name, email, username, password, role, location, phone_number } = req.body;


  // Hash password before saving
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    let query, values;

if (role === 'farmer') {
  query = 'INSERT INTO users (full_name, email, username, password, role, location, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)';
  values = [full_name, email, username, hashedPassword, role, phone_number, location];
} else {
  query = 'INSERT INTO users (full_name, email, username, password, role) VALUES (?, ?, ?, ?, ?)';
  values = [full_name, email, username, hashedPassword, role];
}

db.query(query, values, (err, result) => {

      if (err) return res.status(500).json({ message: 'Signup failed', error: err });

      // Log activity
      logActivity(username, role, 'Signed up');

      res.status(201).json({ message: 'User signed up successfully!' });
    });
  });
});
router.post('/login', (req, res) => {
  const { username, password, role: selectedRole } = req.body; // get role from request body
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];

    // Check if role matches
    if (user.role !== selectedRole) {
      return res.status(401).json({ success: false, message: `Role mismatch. You selected '${selectedRole}', but this account is a '${user.role}'.` });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Log login activity
      logActivity(user.username, user.role, 'Logged in');

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        }
      });
    });
  });
});

// Configure nodemailer transporter (use your SMTP/email provider credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password-or-app-password'
  }
});

// 1. Request password reset
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Email not found' });

    const user = results[0];
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour expiry

    // Store token and expiry in DB
    db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expires, user.id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Error setting reset token' });

        // Send reset email
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        const mailOptions = {
          from: '"Your App" <your-email@gmail.com>',
          to: email,
          subject: 'Password Reset Request',
          html: `<p>You requested a password reset.</p>
                 <p>Click this link to reset your password (valid for 1 hour):</p>
                 <a href="${resetUrl}">${resetUrl}</a>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ message: 'Error sending email' });
          }
          res.json({ message: 'Password reset email sent' });
        });
      }
    );
  });
});

// 2. Reset password
router.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find user with matching token and valid expiry
  db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
    [token],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired token' });

      const user = results[0];

      // Hash new password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        // Update user password and clear reset token fields
        db.query(
          'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
          [hashedPassword, user.id],
          (err) => {
            if (err) return res.status(500).json({ message: 'Error updating password' });

            res.json({ message: 'Password reset successful' });
          }
        );
      });
    }
  );
});

module.exports = router;



