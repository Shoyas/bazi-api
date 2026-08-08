"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("./prisma");
const seedSuperAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
            console.log("Admin email or password not provided in .env, skipping seed.");
            return;
        }
        const existingAdmin = await prisma_1.prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (!existingAdmin) {
            const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
            await prisma_1.prisma.user.create({
                data: {
                    name: "Super Admin",
                    email: adminEmail,
                    password: hashedPassword,
                    role: "ADMIN",
                    isEmailVerified: true,
                },
            });
            console.log("Super admin seeded successfully.");
        }
        else {
            console.log("Super admin already exists.");
        }
    }
    catch (error) {
        console.error("Error seeding super admin:", error);
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
