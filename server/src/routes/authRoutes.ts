import express, { Router } from 'express';
import { registerUser, loginUser, updateUserRole } from '../controllers/authController.js';
import { getWorkOSAuthorizationUrl, handleWorkOSCallback } from '../controllers/workosAuthController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, updateUserRoleSchema } from '../schemas/index.js';

const router: Router = express.Router();

// Public auth routes — with strict rate limiting & input validation
router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);

// WorkOS AuthKit routes
router.get('/workos/url', authLimiter, getWorkOSAuthorizationUrl);
router.post('/workos/callback', authLimiter, handleWorkOSCallback);

// Admin-only: change a user's role (promote to admin, demote to customer, etc.)
router.patch(
  '/users/:id/role',
  protect,
  authorizeRoles('admin', 'super_admin'),
  validate(updateUserRoleSchema),
  updateUserRole
);

export default router;
