
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Add to Cart 
router.post('/add', (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;

  db.query(sql, [user_id, product_id, quantity], (err, result) => {
    if (err) {
      console.error("❌ Error inserting into cart_items:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Product added to cart" });
  });
});

// Get cart items by user
// Get cart items by user (with farmer info)
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
  SELECT 
    c.id, 
    c.quantity, 
    p.id AS product_id, 
    p.name, 
    p.image, 
    p.price, 
    p.unit,
    f.full_name AS farmer_name,
    f.phone_number AS farmer_phone,
    f.location AS farmer_location
  FROM cart_items c
  JOIN products p ON c.product_id = p.id
  JOIN users f ON p.farmer_id = f.id
  WHERE c.user_id = ?
`;


  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching cart with farmer info:", err);
      return res.status(500).json({ message: "Error retrieving cart items" });
    }
    res.json(results);
  });
});


// Update item quantity
router.put('/update', (req, res) => {
  const { item_id, quantity } = req.body;

  if (!item_id || quantity === undefined) {
    return res.status(400).json({ message: "Item ID and quantity required" });
  }

  const sql = `UPDATE cart_items SET quantity = ? WHERE id = ?`;

  db.query(sql, [quantity, item_id], (err, result) => {
    if (err) {
      console.error("Error updating quantity:", err);
      return res.status(500).json({ message: "Error updating quantity" });
    }

    res.json({ message: "Quantity updated successfully" });
  });
});

// Delete item from cart
router.delete('/:itemId', (req, res) => {
  const { itemId } = req.params;

  const sql = `DELETE FROM cart_items WHERE id = ?`;

  db.query(sql, [itemId], (err, result) => {
    if (err) {
      console.error("Error deleting item:", err);
      return res.status(500).json({ message: "Error removing item" });
    }

    res.json({ message: "Item removed from cart" });
  });
});

module.exports = router;
