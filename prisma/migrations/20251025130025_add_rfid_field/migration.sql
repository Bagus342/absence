/*
  Warnings:

  - A unique constraint covering the columns `[rfid]` on the table `Siswa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rfid` to the `Siswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Siswa" ADD COLUMN     "rfid" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_rfid_key" ON "public"."Siswa"("rfid");
