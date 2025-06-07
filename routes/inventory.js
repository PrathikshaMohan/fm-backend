const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET low-stock products for farmers
router.get("/low-stock", (req, res) => {
  const farmerId = req.query.farmerId;

  if (!farmerId) {
    return res.status(400).json({ message: "Missing farmerId" });
  }

  const defaultThreshold = 5;
  const pieceThreshold = 10;

  // Get unit param from query 
  const unitFilter = req.query.unit; 

  // Set threshold based on unit
  const threshold = unitFilter === "piece" ? pieceThreshold : defaultThreshold;

  // Query: select products for this farmer where quantity <= threshold
  // If unitFilter is provided, also filter by unit
  let query = "SELECT id, name, quantity, unit FROM products WHERE farmer_id = ? AND quantity <= ?";
  const params = [farmerId, threshold];

  if (unitFilter) {
    query += " AND unit = ?";
    params.push(unitFilter);
  }

  db.query(query, params, (error, results) => {
    if (error) {
      console.error("Error fetching low-stock products:", error);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

module.exports = router;
