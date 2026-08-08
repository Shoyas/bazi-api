import { z } from 'zod';

export const baziValidationSchema = z.object({
  body: z.object({
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be in YYYY-MM-DD format'),
    birthTime: z.string().regex(/^(\d{2}:\d{2}|)$/, 'birthTime must be in HH:mm format or empty').optional(),
    gender: z.enum(['male', 'female']),
    timezone: z.string().optional().default('Asia/Shanghai'),
    language: z.enum(['en', 'zh']).optional().default('en'),
  }),
});
