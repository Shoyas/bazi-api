import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const seedSuperAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("Admin email or password not provided in .env, skipping seed.");
      return;
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: {
          name: "Super Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          isEmailVerified: true,
        },
      });
      console.log("Super admin seeded successfully.");
    } else {
      console.log("Super admin already exists.");
    }
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
};
