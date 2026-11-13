/*
  Warnings:

  - You are about to alter the column `acquisitionPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `salePrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "acquisitionPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "salePrice" SET DATA TYPE DECIMAL(12,2);
