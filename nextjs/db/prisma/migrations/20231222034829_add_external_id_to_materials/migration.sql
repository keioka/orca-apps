/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `materials` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "external_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "materials_external_id_key" ON "materials"("external_id");
