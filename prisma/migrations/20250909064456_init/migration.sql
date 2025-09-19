/*
  Warnings:

  - You are about to drop the `Izin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Izin" DROP CONSTRAINT "Izin_nis_fkey";

-- DropTable
DROP TABLE "public"."Izin";

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" SERIAL NOT NULL,
    "nis" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "keterangan" "public"."Keterangan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_nis_fkey" FOREIGN KEY ("nis") REFERENCES "public"."Siswa"("nis") ON DELETE CASCADE ON UPDATE CASCADE;
