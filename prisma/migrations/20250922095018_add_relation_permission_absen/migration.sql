/*
  Warnings:

  - A unique constraint covering the columns `[absenId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `absenId` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Permission" ADD COLUMN     "absenId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_absenId_key" ON "public"."Permission"("absenId");

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_absenId_fkey" FOREIGN KEY ("absenId") REFERENCES "public"."Absen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
