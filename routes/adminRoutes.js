const express = require('express');
const router = express.Router();
const db = require('../config/db');
const {
  adminLogin
} = require('../controllers/adminController'); 

// Admin login route
router.post('/login', adminLogin);  

const {
  getAllProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/adminProductController");

const {
  getAllUsers,
  deleteUser,
  updateUser
} = require("../controllers/adminUserController");

// Products routes
router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

// Users routes
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUser);


const {
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/adminOrderController');

// Update order status
router.put('/orders/:id', updateOrderStatus);

// Get all orders
router.get('/orders', getAllOrders);

// Get single order by ID with user info
router.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT o.*, u.full_name, u.email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    WHERE o.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(results[0]);
  });
});

module.exports = router;