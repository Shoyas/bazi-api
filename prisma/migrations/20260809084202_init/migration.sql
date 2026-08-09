-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
