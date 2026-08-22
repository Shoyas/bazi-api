"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingValidation = void 0;
const zod_1 = require("zod");
const updateSystemSettingZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        value: zod_1.z.string({
            message: 'Value is required',
        }),
        description: zod_1.z.string().optional(),
    }),
});
exports.SystemSettingValidation = {
    updateSystemSettingZodSchema,
};
