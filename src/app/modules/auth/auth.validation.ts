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

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      message: 'Old password is required',
    }),
    newPassword: z.string({
      message: 'New password is required',
    }).min(6, 'Password must be at least 6 characters'),
  }),
});

const forgotPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({
      message: 'Email is required',
    }).email('Invalid email address'),
  }),
});

const resetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({
      message: 'Email is required',
    }).email('Invalid email address'),
    otp: z.string({
      message: 'OTP is required',
    }).length(6, 'OTP must be exactly 6 characters'),
    newPassword: z.string({
      message: 'New password is required',
    }).min(6, 'Password must be at least 6 characters'),
  }),
});

export const AuthValidation = {
  registerZodSchema,
  loginZodSchema,
  verifyEmailZodSchema,
  changePasswordZodSchema,
  forgotPasswordZodSchema,
  resetPasswordZodSchema,
};
