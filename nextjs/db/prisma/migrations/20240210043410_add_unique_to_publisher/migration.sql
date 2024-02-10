/*
  Warnings:

  - A unique constraint covering the columns `[domain]` on the table `publishers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "publishers_domain_key" ON "publishers"("domain");
