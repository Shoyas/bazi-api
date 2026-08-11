import { z } from 'zod';

const updateSystemSettingZodSchema = z.object({
  body: z.object({
    value: z.string({
      message: 'Value is required',
    }),
    description: z.string().optional(),
  }),
});

export const SystemSettingValidation = {
  updateSystemSettingZodSchema,
};
