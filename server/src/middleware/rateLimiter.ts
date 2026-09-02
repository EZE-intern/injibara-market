import rateLimit from 'express-rate-limit';

/**
 * 1. Global API Rate Limiter
 * Applied across all incoming /api requests.
 * Allows up to 300 requests per 15 minutes per IP address.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true, // Return standard RateLimit headers in response
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this device. Please slow down and try again shortly.',
  },
});

/**
 * 2. Strict Auth Rate Limiter
 * Applied specifically to sensitive authentication endpoints (/login, /register).
 * Protects against brute-force attacks and credential stuffing.
 * Allows up to 10 attempts per 15 minutes per IP address.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please wait 15 minutes before trying again.',
  },
});

/**
 * 3. Product & Upload Creation Limiter
 * Applied to POST /api/products and POST /api/stores.
 * Protects Cloudinary upload bandwidth and prevents spam listings.
 * Allows up to 25 creation requests per 15 minutes per IP address.
 */
export const creationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have created too many listings in a short period. Please wait a few minutes before adding more items.',
  },
});
