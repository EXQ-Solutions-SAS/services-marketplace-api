-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "deletedAt" TIMESTAMP(3);
