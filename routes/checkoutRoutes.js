const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
  const {
  user_id,
  payment_method = "Cash on Delivery",
  firstName,
  lastName,
  phone,
  pickup_location,
  pickup_time_slot
} = req.body;


if (!user_id || !firstName || !lastName || !phone) {
  return res.status(400).json({ message: "All buyer fields are required" });
}

  if (!user_id) return res.status(400).json({ message: "User ID is required" });

  const cartQuery = `
  SELECT ci.*, p.price, p.quantity AS stock, p.farmer_id, p.name, p.unit, ci.user_id AS buyer_id,
       u.full_name AS farmer_name,
       u.phone_number AS farmer_phone,
       u.location AS farmer_location
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
JOIN users u ON p.farmer_id = u.id
WHERE ci.user_id = ?

`;


  db.query(cartQuery, [user_id], (err, cartItems) => {
    if (err) return res.status(500).json({ message: "Error fetching cart", error: err });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.name}` });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Insert into orders table
    const orderQuery = `
  INSERT INTO orders (
    user_id, total, payment_method, 
    buyer_first_name, buyer_last_name, buyer_phone,
    pickup_location, pickup_time_slot
  ) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

db.query(
  orderQuery,
  [
    user_id,
    total,
    payment_method,
    firstName,
    lastName,
    phone,
    pickup_location,
    pickup_time_slot
  ],
  (err, orderResult) => {
      if (err) return res.status(500).json({ message: "Error creating order", error: err });

      const order_id = orderResult.insertId;

      // Insert each item into order_items
      const itemQueries = cartItems.map(item => {
        return new Promise((resolve, reject) => {
          db.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
            [order_id, item.product_id, item.quantity, item.price],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      // Update stock
      const stockUpdates = cartItems.map(item => {
        return new Promise((resolve, reject) => {
          db.query(
            `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
            [item.quantity, item.product_id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      const notificationQueries = cartItems.map(item => {
  return new Promise((resolve, reject) => {
    const message = `New order received for ${item.quantity} ${item.unit} of ${item.name}`;
    const status = "Pending";

    db.query(
      `INSERT INTO notifications 
        (order_id, farmer_id, buyer_id, product_name, quantity, unit, price, status, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        order_id,
        item.farmer_id,
        item.buyer_id,
        item.name,
        item.quantity,
        item.unit || 'unit',
        item.price,
        status,
        message
      ],
      (err4) => {
        if (err4) {
          console.error("❌ Notification insert error:", err4);
          reject(err4);
        } else {
          resolve();
        }
      }
    );
  });
});


      // Execute all
      Promise.all([...itemQueries, ...stockUpdates, ...notificationQueries])
        .then(() => {
          db.query("DELETE FROM cart_items WHERE user_id = ?", [user_id], (err) => {
            if (err) {
              return res.status(500).json({ message: "Order placed, but failed to clear cart" });
            }
            return res.status(200).json({ message: "🎉 Order placed successfully!",
               order_id,
              items:cartItems });

          });
        })
        .catch(err => {
          console.error("Checkout error:", err);
          res.status(500).json({ message: "Checkout failed", error: err });
        });
    });
  });
});


module.exports = router;
