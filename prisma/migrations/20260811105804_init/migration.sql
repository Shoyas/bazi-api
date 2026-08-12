/*
  Warnings:

  - The values [MONTHLY,YEARLY] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('FREE', 'BASIC', 'PRO', 'PREMIUM');
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "SubscriptionPlan_new" USING ("plan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "billingCycle" "BillingCycle";
