/*
  Warnings:

  - Added the required column `description` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerHour` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "pricePerHour" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
