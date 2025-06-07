const express = require('express');
const router = express.Router();
const marketPriceController = require('../controllers/marketPrice');

// Route definitions
router.get('/', marketPriceController.getMarketPrices);
router.post('/', marketPriceController.addMarketPrice);
router.put('/:id', marketPriceController.updateMarketPrice);
router.delete('/:id', marketPriceController.deleteMarketPrice);

module.exports = router;
