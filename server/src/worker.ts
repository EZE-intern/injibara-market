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
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (
        origin === 'https://adeymarket.et' ||
        origin === 'https://www.adeymarket.et' ||
        origin === 'http://localhost:5173' ||
        /^https:\/\/([a-zA-Z0-9-]+\.)*pages\.dev$/.test(origin)
      ) {
        return origin;
      }
      return null;
    },
    credentials: true,
  })
);

// Attach Prisma instance to request context using DATABASE_URL from worker bindings
app.use('*', async (c, next) => {
  if (c.env?.DATABASE_URL) {
    c.set('prisma', getPrisma(c.env.DATABASE_URL));
  } else if (c.req.path.startsWith('/api/') && c.req.path !== '/api/health') {
    console.error('[Worker Error] DATABASE_URL is not configured in environment bindings.');
    return c.json(
      {
        success: false,
        message: 'Database service is temporarily unavailable. Missing configuration.',
      },
      503
    );
  }
  await next();
});

// Rate limiter for API routes
app.use('/api/*', globalLimiter);

// Health check endpoints
app.get('/', (c) => {
  return c.json({
    status: 'success',
    message: 'Adey Market API is running smoothly',
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

app.get('/api/health', async (c) => {
  try {
    const prisma = c.get('prisma');
    if (prisma) {
      await prisma.$queryRawUnsafe('SELECT 1');
      return c.json({ status: 'ok', database: 'connected' }, 200);
    }
    return c.json({ status: 'degraded', database: 'unconfigured' }, 503);
  } catch (error) {
    console.error('Database ping error in /api/health:', error);
    return c.json({ status: 'error', database: 'disconnected' }, 500);
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
