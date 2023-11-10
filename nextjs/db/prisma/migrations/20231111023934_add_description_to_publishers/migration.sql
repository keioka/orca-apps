/*
  Warnings:

  - You are about to drop the column `recommended` on the `publishers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "publishers" DROP COLUMN "recommended",
ADD COLUMN     "description" TEXT;
