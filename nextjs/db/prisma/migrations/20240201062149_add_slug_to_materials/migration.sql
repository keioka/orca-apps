/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `materials` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "slug" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "materials_slug_key" ON "materials"("slug");
