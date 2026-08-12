"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const updateUserStatusZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['active', 'blocked'], {
            message: 'Status is required',
        }),
    }),
});
const bulkSoftDeleteZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        userIds: zod_1.z.array(zod_1.z.string({
            message: 'User IDs array is required',
        })).min(1, 'At least one User ID is required'),
    }),
});
exports.UserValidation = {
    updateUserStatusZodSchema,
    bulkSoftDeleteZodSchema,
};
