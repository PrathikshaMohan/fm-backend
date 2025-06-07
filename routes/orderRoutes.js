// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Fetch user orders with product details and pickup info
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      o.id AS order_id,
      o.status,
      o.order_date,
      o.buyer_first_name,
      o.buyer_last_name,
      o.buyer_phone,
      o.pickup_location,
      o.pickup_time_slot,
      p.name AS product_name,
      p.unit,
      oi.quantity,
      oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user orders with products:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const groupedOrders = {};

    results.forEach(row => {
      if (!groupedOrders[row.order_id]) {
        groupedOrders[row.order_id] = {
          id: row.order_id,
          status: row.status,
          order_date: row.order_date,
          buyer_first_name: row.buyer_first_name,
          buyer_last_name: row.buyer_last_name,
          buyer_phone: row.buyer_phone,
          pickup_location: row.pickup_location,
          pickup_time_slot: row.pickup_time_slot,
          products: [],
        };
      }

      groupedOrders[row.order_id].products.push({
        product_name: row.product_name,
        unit: row.unit,
        quantity: row.quantity,
        price: row.price,
      });
    });

    res.json(Object.values(groupedOrders));
  });
});
// PUT route to update order status and optionally pickup details
router.put('/:orderId/status', (req, res) => {
  const orderId = req.params.orderId;
  const { status, pickup_location, pickup_time_slot } = req.body;

  // Validate status
  const allowedStatuses = ['Pending', 'Accepted', 'Ready for Pickup', 'Completed', 'Cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Build update query
  const sql = `
    UPDATE orders
    SET status = ?,
        pickup_location = ?,
        pickup_time_slot = ?
    WHERE id = ?
  `;

  db.query(sql, [status, pickup_location || null, pickup_time_slot || null, orderId], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  });
});

module.exports = router;
