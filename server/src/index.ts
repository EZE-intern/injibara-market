import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoute from './routes/productRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(cors());
app.use(express.json());

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
app.use('/api/products', productRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server setup complete on port ${PORT}`);
});
