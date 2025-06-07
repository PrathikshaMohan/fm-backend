const db = require('../config/db');

// Fetch all products (admin)
const getAllProducts = (req, res) => {
  const query = "SELECT p.*, u.full_name as farmer_name FROM products p JOIN users u ON p.farmer_id = u.id";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Delete product
const deleteProduct = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product deleted successfully" });
  });
};

// Update product 
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, unit, category } = req.body;
  const query = "UPDATE products SET name=?, price=?, quantity=?, unit=?, category=? WHERE id=?";
  db.query(query, [name, price, quantity, unit, category, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product updated successfully" });
  });
};

module.exports = {
  getAllProducts,
  deleteProduct,
  updateProduct
};
