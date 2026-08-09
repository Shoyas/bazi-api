import { z } from 'zod';

const updateUserStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'blocked'], {
      required_error: 'Status is required',
    }),
  }),
});

const bulkSoftDeleteZodSchema = z.object({
  body: z.object({
    userIds: z.array(
      z.string({
        required_error: 'User IDs array is required',
      })
    ).min(1, 'At least one User ID is required'),
  }),
});

export const UserValidation = {
  updateUserStatusZodSchema,
  bulkSoftDeleteZodSchema,
};
