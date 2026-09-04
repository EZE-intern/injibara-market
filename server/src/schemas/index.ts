import { z } from 'zod';

/**
 * Ethiopian phone number regex.
 * Accepts: 0911223344, 0712345678, +251911223344, 251911223344
 * Rejects: 08..., 05..., short numbers, letters, non-Ethiopian country codes
 */
const ethiopianPhone = z
  .string()
  .transform((val) => val.replace(/[\s\-().]/g, '')) // strip formatting
  .pipe(
    z
      .string()
      .regex(
        /^(?:\+?251|0)(9|7)\d{8}$/,
        'Invalid Ethiopian phone number. Use format: 09xxxxxxxx or +251xxxxxxxxx'
      )
  )
  .transform((val) => {
    // Normalize to 09xxxxxxxx / 07xxxxxxxx format for consistent DB storage
    const match = val.match(/(?:\+?251|0)((?:9|7)\d{8})$/);
    return match ? `0${match[1]}` : val;
  });

// Helper for FormData fields that send "" when empty
const optionalNumber = (schema: z.ZodType) =>
  z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), schema);

const optionalString = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.string().optional()
);

// Helper for email normalization (trim and lowercase before validation)
const sanitizedEmail = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
  z
    .string({ message: 'Email is required' })
    .email('Please enter a valid email address')
    .max(200)
);

// ─── Auth Schemas ────────────────────────────────────────────────────

export const registerSchema = z.object({
  full_name: z
    .string({ message: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters')
    .transform((val) => val.trim()),

  email: sanitizedEmail,

  password: z
    .string({ message: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be at most 128 characters'),

  phone: ethiopianPhone.optional(),

  // SECURITY: Public registration only allows customer or seller.
  // Admin role can ONLY be assigned through the admin promotion endpoint
  // or via the INITIAL_ADMIN_EMAILS environment variable.
  role: z.enum(['customer', 'seller']).optional().default('customer'),
});

export const loginSchema = z.object({
  email: sanitizedEmail,

  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required'),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'seller', 'admin'], {
    message: 'Role must be one of: customer, seller, admin',
  }),
});

// ─── Product Schemas ─────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z
    .string({ message: 'Product name is required' })
    .min(2, 'Product name must be at least 2 characters')
    .max(150, 'Product name must be at most 150 characters')
    .transform((val) => val.trim()),

  description: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),

  price: z.coerce
    .number({ message: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(100_000_000, 'Price is unreasonably high'),

  discount_price: optionalNumber(
    z.coerce.number().positive('Discount price must be greater than 0').optional()
  ),

  stock: optionalNumber(
    z.coerce
      .number()
      .int('Stock must be a whole number')
      .nonnegative('Stock cannot be negative')
      .optional()
  ),

  category_id: optionalNumber(
    z.coerce.number().int().positive('Category ID must be a positive number').optional()
  ),

  store_id: optionalNumber(
    z.coerce.number().int().positive('Store ID must be a positive number').optional()
  ),

  location: optionalString.transform((val) =>
    typeof val === 'string' && val.trim().length > 0
      ? val.trim().toLowerCase()
      : undefined
  ),
}).refine(
  (data) => {
    if (data.discount_price !== undefined && data.price !== undefined) {
      return Number(data.discount_price) < Number(data.price);
    }
    return true;
  },
  { message: 'Discount price must be less than the regular price', path: ['discount_price'] }
);

export const updateProductSchema = z.object({
  name: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),

  description: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),

  location: optionalString.transform((val) =>
    typeof val === 'string' && val.trim().length > 0
      ? val.trim().toLowerCase()
      : undefined
  ),

  price: optionalNumber(
    z.coerce.number().positive('Price must be greater than 0').max(100_000_000).optional()
  ),

  discount_price: optionalNumber(
    z.coerce.number().positive('Discount price must be greater than 0').optional()
  ),

  stock: optionalNumber(
    z.coerce.number().int().nonnegative('Stock cannot be negative').optional()
  ),

  category_id: optionalNumber(
    z.coerce.number().int().positive().optional()
  ),

  store_id: optionalNumber(
    z.coerce.number().int().positive().optional()
  ),
});

// ─── Order Schemas ───────────────────────────────────────────────────

const orderItemSchema = z.object({
  product_id: z.coerce
    .number({ message: 'Product ID is required' })
    .int()
    .positive('Product ID must be a positive number'),

  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1')
    .default(1),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item'),

  shipping_address: optionalString,

  payment_method: z
    .string()
    .max(50)
    .optional()
    .default('cash_on_delivery'),

  note: optionalString,
});

// ─── Category Schemas ────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z
    .string({ message: 'Category name is required' })
    .min(2, 'Category name must be at least 2 characters')
    .max(100)
    .transform((val) => val.trim()),

  description: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),

  image: optionalString,
});

export const updateCategorySchema = z.object({
  name: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),

  description: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),

  image: optionalString,
});

// ─── Store Schemas ───────────────────────────────────────────────────

export const createStoreSchema = z.object({
  store_name: z
    .string({ message: 'Store name is required' })
    .min(2, 'Store name must be at least 2 characters')
    .max(100)
    .transform((val) => val.trim()),

  description: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),

  phone: ethiopianPhone.optional(),

  address: optionalString.transform((val) => (typeof val === 'string' ? val.trim() : undefined)),
});

// ─── Type Exports ────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
