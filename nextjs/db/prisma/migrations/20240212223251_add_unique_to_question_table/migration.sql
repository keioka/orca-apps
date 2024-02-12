/*
  Warnings:

  - A unique constraint covering the columns `[content,paragraph_number,material_id]` on the table `questions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "questions_content_paragraph_number_material_id_key" ON "questions"("content", "paragraph_number", "material_id");
