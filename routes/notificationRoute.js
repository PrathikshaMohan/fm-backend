const express = require('express');
const router = express.Router();
const db = require('../config/db'); // or your db connection file

// 🔔 Route 1: GET notifications for a specific farmer
router.get('/:farmerId', (req, res) => {
  const farmerId = req.params.farmerId;

  const sql = `
    SELECT n.*, 
           u.full_name, 
           u.phone_number
    FROM notifications n
    JOIN users u ON n.buyer_id = u.id
    WHERE n.farmer_id = ?
    ORDER BY n.created_at DESC
  `;

  db.query(sql, [farmerId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});

// 📦 Route 2: GET farmer orders with buyer & product info
router.get('/orders/:farmerId', (req, res) => {
  const farmerId = req.params.farmerId;

  const sql = `
    SELECT 
      o.id AS order_id,
      o.status,
      o.order_date,
      o.pickup_location,
      o.pickup_time_slot,
      o.buyer_first_name,
      o.buyer_last_name,
      o.buyer_phone,

      p.name AS product_name,
      p.unit,
      oi.quantity,
      oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.farmer_id = ?
    ORDER BY o.order_date DESC
  `;

  db.query(sql, [farmerId], (err, results) => {
    if (err) {
      console.error('Error fetching farmer orders:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const orders = {};

    results.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          id: row.order_id,
          status: row.status,
          order_date: row.order_date,
          buyer_first_name: row.buyer_first_name,
          buyer_last_name: row.buyer_last_name,
          buyer_phone: row.buyer_phone,
          pickup_location: row.pickup_location,
          pickup_time_slot: row.pickup_time_slot,
          products: [],
          total: 0 
        };
      }

     orders[row.order_id].products.push({
  product_name: row.product_name,
  quantity: row.quantity,
  unit: row.unit,
  price: row.price
});

// Accumulate the total
if (!orders[row.order_id].total) {
  orders[row.order_id].total = 0;
}
orders[row.order_id].total += row.quantity * row.price;

    });

    res.json(Object.values(orders));
  });
});

// PUT route to update order status and optionally pickup location/time slot
router.put('/orders/:orderId/status', (req, res) => {
  const orderId = req.params.orderId;
  const { status, pickup_location, pickup_time_slot } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  let query = 'UPDATE orders SET status = ?';
  const params = [status];

  if (pickup_location !== undefined) {
    query += ', pickup_location = ?';
    params.push(pickup_location);
  }
  if (pickup_time_slot !== undefined) {
    query += ', pickup_time_slot = ?';
    params.push(pickup_time_slot);
  }

  query += ' WHERE id = ?';
  params.push(orderId);

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    return res.json({ success: true, message: 'Order updated successfully' });
  });
});

module.exports = router;
