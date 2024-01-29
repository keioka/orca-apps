/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `vocabularies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "vocabularies" ADD COLUMN     "external_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "vocabularies_external_id_key" ON "vocabularies"("external_id");
