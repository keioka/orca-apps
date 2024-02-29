/*
  Warnings:

  - A unique constraint covering the columns `[level,material_id]` on the table `summaries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "summaries_level_material_id_key" ON "summaries"("level", "material_id");
