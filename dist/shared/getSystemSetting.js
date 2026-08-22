"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemSetting = void 0;
const prisma_1 = require("./prisma");
const getSystemSetting = async (key, defaultValue) => {
    const setting = await prisma_1.prisma.systemSetting.findUnique({
        where: { key },
    });
    if (setting) {
        return setting.value;
    }
    // If not found, we can optionally create the default one so it shows up in UI for admin
    try {
        await prisma_1.prisma.systemSetting.create({
            data: {
                key,
                value: defaultValue,
                description: `Auto-generated default for ${key}`,
            },
        });
    }
    catch (error) {
        // Ignore error if it was created concurrently
    }
    return defaultValue;
};
exports.getSystemSetting = getSystemSetting;
