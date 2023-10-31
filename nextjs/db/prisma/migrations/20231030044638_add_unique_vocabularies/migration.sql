/*
  Warnings:

  - A unique constraint covering the columns `[word,material_id]` on the table `vocabularies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vocabularies_word_material_id_key" ON "vocabularies"("word", "material_id");
