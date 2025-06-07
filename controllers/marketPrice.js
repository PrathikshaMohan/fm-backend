const db = require('../config/db');

//Get market prices (with optional date filter)
exports.getMarketPrices = (req, res) => {
  const { date } = req.query;
  let sql;

  if (date === 'today') {
    sql = `SELECT * FROM market_prices WHERE date = CURDATE() ORDER BY date DESC`;
  } else if (date === 'yesterday') {
    sql = `SELECT * FROM market_prices WHERE date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY date DESC`;
  } else {
    sql = `SELECT * FROM market_prices ORDER BY date DESC`;
  }

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

//Add new market price
exports.addMarketPrice = (req, res) => {
  const { product_name, location, price_per_kg, category } = req.body;

  if (!product_name || !location || !price_per_kg) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO market_prices (product_name, location, price_per_kg, category, date)
    VALUES (?, ?, ?, ?, CURDATE())
  `;
  db.query(sql, [product_name, location, price_per_kg, category || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Market price added', id: result.insertId });
  });
};

//Update market price
exports.updateMarketPrice = (req, res) => {
  const { id } = req.params;
  const { product_name, location, price_per_kg, category } = req.body;

  const sql = `
    UPDATE market_prices
    SET product_name = ?, location = ?, price_per_kg = ?, category = ?
    WHERE id = ?
  `;
  db.query(sql, [product_name, location, price_per_kg, category || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Market price not found' });
    res.json({ message: 'Market price updated' });
  });
};

//Delete market price
exports.deleteMarketPrice = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM market_prices WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Market price not found' });
    res.json({ message: 'Market price deleted' });
  });
};
