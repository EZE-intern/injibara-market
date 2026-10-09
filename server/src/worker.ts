import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppContext } from './types/context.js';
import { getPrisma } from './lib/prisma.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = new Hono<AppContext>();

// CORS middleware
app.use('*', cors());

// Attach Prisma instance to request context using DATABASE_URL from worker bindings
app.use('*', async (c, next) => {
  if (c.env?.DATABASE_URL) {
    c.set('prisma', getPrisma(c.env.DATABASE_URL));
  }
  await next();
});

// Rate limiter for API routes
app.use('/api/*', globalLimiter);

// Health check endpoints
app.get('/', (c) => {
  return c.json({
    status: 'success',
    message: 'Injibara Market API is running smoothly',
  });
});

app.get('/healthz', async (c) => {
  try {
    const prisma = c.get('prisma');
    if (prisma) {
      await prisma.$queryRawUnsafe('SELECT 1');
    }
    return c.text('OK', 200);
  } catch (error) {
    console.error('Database ping error in /healthz:', error);
    return c.text('OK', 200);
  }
});

// Mount modular sub-routers
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/categories', categoryRoutes);
app.route('/api/stores', storeRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/messages', messageRoutes);
app.route('/api/admin', adminRoutes);

// 404 Handler for undefined routes
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: `API endpoint not found: ${c.req.method} ${c.req.url}`,
    },
    404
  );
});

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled worker error:', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  return c.json(
    {
      success: false,
      message,
    },
    500
  );
});

export default app;
