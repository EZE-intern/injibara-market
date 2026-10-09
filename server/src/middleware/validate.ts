import { zValidator } from '@hono/zod-validator';
import type { z } from 'zod';

export const validate = (target: 'json' | 'query' | 'param', schema: z.ZodType) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const fieldErrors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return c.json(
        {
          success: false,
          message: 'Validation failed. Please check your input.',
          errors: fieldErrors,
        },
        400
      );
    }
  });

export default validate;
