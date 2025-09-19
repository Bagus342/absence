/*
  Warnings:

  - You are about to drop the `Cok` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Cok";

-- CreateTable
CREATE TABLE "public"."Libur" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Libur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Libur_tanggal_idx" ON "public"."Libur"("tanggal");

-- CreateIndex
CREATE INDEX "Absen_createdAt_idx" ON "public"."Absen"("createdAt");

-- CreateIndex
CREATE INDEX "Absen_status_idx" ON "public"."Absen"("status");

-- CreateIndex
CREATE INDEX "Permission_createdAt_idx" ON "public"."Permission"("createdAt");

-- CreateIndex
CREATE INDEX "Permission_status_idx" ON "public"."Permission"("status");

-- CreateIndex
CREATE INDEX "Siswa_name_idx" ON "public"."Siswa"("name");

-- CreateIndex
CREATE INDEX "Siswa_kelas_idx" ON "public"."Siswa"("kelas");

-- CreateIndex
CREATE INDEX "Siswa_wali_idx" ON "public"."Siswa"("wali");

-- CreateIndex
CREATE INDEX "Siswa_createdAt_idx" ON "public"."Siswa"("createdAt");
