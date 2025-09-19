/*
  Warnings:

  - Added the required column `qr_payload` to the `Siswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Siswa" ADD COLUMN     "qr_payload" TEXT NOT NULL;
