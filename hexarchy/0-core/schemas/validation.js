// Centralized Validation Schemas (Zod)
import { z } from 'zod';

// User schemas
export const userSchemas = {
  create: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional()
  }),

  update: z.object({
    email: z.string().email().optional(),
    username: z.string().min(3).max(30).optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    bio: z.string().max(500).optional()
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
};

// Video schemas
export const videoSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    tags: z.array(z.string()).max(10).optional(),
    visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
    category: z.string().optional()
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    tags: z.array(z.string()).max(10).optional(),
    visibility: z.enum(['public', 'private', 'unlisted']).optional()
  })
};

// Comment schemas
export const commentSchemas = {
  create: z.object({
    videoId: z.string().uuid(),
    text: z.string().min(1).max(1000),
    parentId: z.string().uuid().optional()
  }),

  update: z.object({
    text: z.string().min(1).max(1000)
  })
};

// Payment schemas
export const paymentSchemas = {
  create: z.object({
    amount: z.number().positive().max(1000000),
    currency: z.string().length(3).default('usd'),
    paymentMethodId: z.string(),
    metadata: z.record(z.string()).optional()
  })
};

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Validate function
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

export default {
  userSchemas,
  videoSchemas,
  commentSchemas,
  paymentSchemas,
  paginationSchema,
  validate
};
