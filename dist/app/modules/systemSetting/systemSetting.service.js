"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingService = void 0;
const prisma_1 = require("../../../shared/prisma");
const getAllSettings = async () => {
    const result = await prisma_1.prisma.systemSetting.findMany({
        orderBy: {
            key: 'asc'
        }
    });
    return result;
};
const updateSetting = async (key, payload) => {
    const result = await prisma_1.prisma.systemSetting.upsert({
        where: {
            key,
        },
        update: {
            value: payload.value,
            ...(payload.description && { description: payload.description }),
        },
        create: {
            key,
            value: payload.value,
            description: payload.description,
        },
    });
    return result;
};
exports.SystemSettingService = {
    getAllSettings,
    updateSetting,
};
