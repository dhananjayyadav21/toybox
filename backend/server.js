import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';


// Connect to Database
connectDB();

const app = express();

// Trust proxy (required for express-rate-limit on hosting platforms like Render)
app.set('trust proxy', 1);


// Security and utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images from external URLs without CORS headers issues
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL   // e.g. https://toybox.vercel.app
    : '*',
  credentials: true
}));

app.use(express.json());

// Log API requests in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting (Prevent abuse on auth & checkout paths)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);

// Simple Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the ToyBox Premium E-Commerce API!' });
});

// 404 & Error Handler Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ToyBox Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
