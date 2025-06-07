const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db=require("../config/db");

const {
  addProduct,
  updateProduct,
  getAllProducts
} = require("../controllers/productController");

// Get all products
router.get('/', getAllProducts);
// Setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// POST route to add product (with image upload)
router.post("/", upload.single("image"), addProduct);

// GET route to fetch products by farmer ID
router.get("/farmer/:farmer_id", require("../controllers/productController").getProductsByFarmer);

// PUT route to update product
router.put("/:id", upload.single("image"), updateProduct);


router.delete("/:id", require("../controllers/productController").deleteProduct);

module.exports = router;
