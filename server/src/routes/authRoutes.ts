import { Hono } from 'hono';
import type { AppContext } from '../types/context.js';
import { registerUser, loginUser, updateUserRole } from '../controllers/authController.js';
import { getWorkOSAuthorizationUrl, handleWorkOSCallback } from '../controllers/workosAuthController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateUserRoleSchema } from '../schemas/index.js';

const app = new Hono<AppContext>();

app.post('/register', authLimiter, validate('json', registerSchema), registerUser);
app.post('/login', authLimiter, validate('json', loginSchema), loginUser);
app.get('/workos/url', getWorkOSAuthorizationUrl);
app.post('/workos/callback', handleWorkOSCallback);
app.patch('/users/:id/role', protect, authorizeRoles('admin'), validate('json', updateUserRoleSchema), updateUserRole);

export default app;
