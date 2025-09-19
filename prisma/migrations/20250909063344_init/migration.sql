-- CreateEnum
CREATE TYPE "public"."Keterangan" AS ENUM ('IZIN', 'SAKIT');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ONTIME', 'LATE', 'PERMISSION');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(150) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Siswa" (
    "id" SERIAL NOT NULL,
    "nis" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "kelas" VARCHAR(50) NOT NULL,
    "image" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "wali" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Absen" (
    "id" SERIAL NOT NULL,
    "nis" TEXT NOT NULL,
    "activity" VARCHAR(150),
    "status" "public"."Status",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Absen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Izin" (
    "id" SERIAL NOT NULL,
    "nis" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "keterangan" "public"."Keterangan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Izin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_nis_key" ON "public"."Siswa"("nis");

-- AddForeignKey
ALTER TABLE "public"."Absen" ADD CONSTRAINT "Absen_nis_fkey" FOREIGN KEY ("nis") REFERENCES "public"."Siswa"("nis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Izin" ADD CONSTRAINT "Izin_nis_fkey" FOREIGN KEY ("nis") REFERENCES "public"."Siswa"("nis") ON DELETE CASCADE ON UPDATE CASCADE;
