const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import DB Connection
const db = require('./config/db');

// 1. Routes ማምጣት
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoute = require('./routes/cartRoutes');
const orderRoute = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const FavoriteRoute = require('./routes/favoriteRoute');
const webhookRoutes = require('./routes/webhookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const storeRoute = require('./routes/storeRoute');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (Uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoints ማገናኘት
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoute);
app.use('/api/orders', orderRoute);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/favorites', FavoriteRoute);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stores', storeRoute);
app.use('/api/messages', messageRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Injibara E-Commerce API Server' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
