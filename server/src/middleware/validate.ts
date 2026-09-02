import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 *
 * If validation passes: sanitized/transformed data replaces req.body and next() is called.
 * If validation fails: returns 400 with structured field-level error messages.
 *
 * Usage in routes:
 *   router.post('/register', validate(registerSchema), registerUser);
 */
export const validate = (schema: z.ZodType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // parseAsync validates AND transforms (trim, lowercase, normalize phone, etc.)
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed. Please check your input.',
          errors: fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
};
