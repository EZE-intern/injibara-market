import express, { Request, Response } from 'express';
import cors from 'cors';
import { globalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import productRoute from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for reverse proxies / cloud environments (Vercel, Railway, Cloudflare)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', globalLimiter);

// Base Health Check Endpoints
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Injibara Market API is running smoothly',
  });
});

app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoute);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server setup complete on port ${PORT}`);
});
