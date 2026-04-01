/*
  Warnings:

  - You are about to drop the column `price` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "price",
ADD COLUMN     "hours" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;
