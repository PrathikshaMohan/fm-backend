const db = require('../config/db');

// Get all orders with buyer details
exports.getAllOrders = (req, res) => {
  const query = `
    SELECT o.*, u.full_name, u.email 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.order_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.status(200).json(results);
  });
};


// Update order status
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err) => {
    if (err) {
      console.error('Update Error:', err);
      return res.status(500).json({ message: 'Update failed' });
    }
    res.status(200).json({ message: 'Order status updated' });
  });
};
