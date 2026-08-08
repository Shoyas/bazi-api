"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const registerZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            message: 'Name is required',
        }),
        email: zod_1.z.string({
            message: 'Email is required',
        }).email('Invalid email address'),
        password: zod_1.z.string({
            message: 'Password is required',
        }).min(6, 'Password must be at least 6 characters'),
        country: zod_1.z.string().optional(),
    }),
});
const loginZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            message: 'Email is required',
        }).email('Invalid email address'),
        password: zod_1.z.string({
            message: 'Password is required',
        }),
    }),
});
const verifyEmailZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            message: 'Email is required',
        }).email('Invalid email address'),
        otp: zod_1.z.string({
            message: 'OTP is required',
        }).length(6, 'OTP must be exactly 6 characters'),
    }),
});
exports.AuthValidation = {
    registerZodSchema,
    loginZodSchema,
    verifyEmailZodSchema,
};
