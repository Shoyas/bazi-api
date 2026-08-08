"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baziValidationSchema = void 0;
const zod_1 = require("zod");
exports.baziValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        birthDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be in YYYY-MM-DD format'),
        birthTime: zod_1.z.string().regex(/^(\d{2}:\d{2}|)$/, 'birthTime must be in HH:mm format or empty').optional(),
        gender: zod_1.z.enum(['male', 'female']),
        timezone: zod_1.z.string().optional().default('Asia/Shanghai'),
        language: zod_1.z.enum(['en', 'zh']).optional().default('en'),
    }),
});
