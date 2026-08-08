import { z } from 'zod';

const registerZodSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Name is required',
    }),
    email: z.string({
      message: 'Email is required',
    }).email('Invalid email address'),
    password: z.string({
      message: 'Password is required',
    }).min(6, 'Password must be at least 6 characters'),
    country: z.string().optional(),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({
      message: 'Email is required',
    }).email('Invalid email address'),
    password: z.string({
      message: 'Password is required',
    }),
  }),
});

const verifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({
      message: 'Email is required',
    }).email('Invalid email address'),
    otp: z.string({
      message: 'OTP is required',
    }).length(6, 'OTP must be exactly 6 characters'),
  }),
});

export const AuthValidation = {
  registerZodSchema,
  loginZodSchema,
  verifyEmailZodSchema,
};
