const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");

require('dotenv').config({ path: './config/config.env' });

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require("./routes/checkoutRoutes");
const marketPriceRoutes = require("./routes/marketPrice");
const adminRoute = require("./routes/adminRoutes");
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require("./routes/setting");
const inventoryRoutes = require("./routes/inventory");
const settingsRoutes = require("./routes/settingsRoutes");
const notificationRoutes = require("./routes/notificationRoute");
const orderRoutes = require("./routes/orderRoutes");


const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev
    'https://f-market.netlify.app/' // Replace with your actual Netlify domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // only needed if using cookies or auth headers
}));
app.use(express.json());

// Dummy auth middleware (replace with real auth)
app.use((req, res, next) => {
  req.user = { id: 1, username: 'testbuyer' }; // hardcoded for testing
  next();
});

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use Routes
app.use('/api', authRoutes);
app.use('/api/products', productRoutes); 
app.use("/api/checkout", checkoutRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/admin', adminRoute); 
app.use("/api/inventory", inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", settingsRoutes);

app.use('/api/notifications' , notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
