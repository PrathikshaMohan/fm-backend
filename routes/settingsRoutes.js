const express = require('express');
const router = express.Router();
const {
  updateAdminPassword,
  clearActivityLogs
} = require('../controllers/adminSettingsController');
const db = require('../config/db');

//Update Admin Password
router.put('/update-password', updateAdminPassword);

router.get('/logs', (req, res) => {
  db.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50', (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch logs' });
    res.json({ logs: results });
  });
});

router.post('/clear', clearActivityLogs);


module.exports = router;
