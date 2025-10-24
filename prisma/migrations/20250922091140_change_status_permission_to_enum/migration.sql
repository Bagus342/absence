/*
  Warnings:

  - The `status` column on the `Absen` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `Permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."StatusPermission" AS ENUM ('WAITING', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "public"."StatusAbsen" AS ENUM ('ONTIME', 'LATE', 'PERMISSION');

-- AlterTable
ALTER TABLE "public"."Absen" DROP COLUMN "status",
ADD COLUMN     "status" "public"."StatusAbsen";

-- AlterTable
ALTER TABLE "public"."Permission" DROP COLUMN "status",
ADD COLUMN     "status" "public"."StatusPermission" NOT NULL;

-- DropEnum
DROP TYPE "public"."Status";

-- CreateIndex
CREATE INDEX "Absen_status_idx" ON "public"."Absen"("status");

-- CreateIndex
CREATE INDEX "Permission_status_idx" ON "public"."Permission"("status");
