import { Hono } from 'hono';
import type { AppContext } from '../types/context.js';
import { createStore, getStores, getStoreById } from '../controllers/storeController.js';
import { protect } from '../middleware/authMiddleware.js';

const app = new Hono<AppContext>();

app.post('/', protect, createStore);
app.get('/', getStores);
app.get('/:id', getStoreById);

export default app;
