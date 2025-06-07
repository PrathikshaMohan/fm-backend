const db = require('../config/db');

// Fetch all products
const getAllProducts = (req, res) => {
  const query = `
    SELECT 
      p.*, 
      u.full_name AS farmer_name, 
      u.phone_number AS farmer_contact, 
      u.location AS farmer_location
    FROM products p
    JOIN users u ON p.farmer_id = u.id
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};


// Fetch products by farmer ID
const getProductsByFarmer = (req, res) => {
  const { farmer_id } = req.params;

  if (isNaN(farmer_id)) {
    return res.status(400).json({ error: "Invalid farmer ID" });
  }

  const query = `
    SELECT 
      p.*, 
      u.full_name AS farmer_name, 
      u.phone_number AS farmer_contact, 
      u.username AS farmer_location 
    FROM products p
    JOIN users u ON p.farmer_id = u.id
    WHERE p.farmer_id = ?
  `;

  db.query(query, [farmer_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};


// Add a new product
const addProduct = (req, res) => {
  const { name, price, quantity, farmer_id, unit, category } = req.body;
  const image = req.file ? req.file.filename : null;
  const created_at = new Date();

  if (!name || !price || !quantity || !farmer_id || !unit || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO products (name, image, price, quantity, farmer_id, unit, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, image, price, quantity, farmer_id, unit, category, created_at], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Product added", id: result.insertId });
  });
};


// Update an existing product
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, unit, category } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !quantity || !unit || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query("SELECT id FROM products WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });

    const query = image
      ? "UPDATE products SET name=?, image=?, price=?, quantity=?, unit=?, category=? WHERE id=?"
      : "UPDATE products SET name=?, price=?, quantity=?, unit=?, category=? WHERE id=?";

    const values = image
      ? [name, image, price, quantity, unit, category, id]
      : [name, price, quantity, unit, category, id];

    db.query(query, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product updated successfully" });
    });
  });
};

// Delete a product
const deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query("SELECT id FROM products WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });

    const query = "DELETE FROM products WHERE id = ?";
    db.query(query, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product deleted successfully" });
    });
  });
};

module.exports = {
  getAllProducts,
  getProductsByFarmer,
  addProduct,
  updateProduct,
  deleteProduct
};
