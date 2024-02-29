/*
  Warnings:

  - You are about to drop the column `loading_vocabs_done_set_count` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `loading_vocabs_set_count` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `vocab_generator_error_messages` on the `materials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "materials" DROP COLUMN "loading_vocabs_done_set_count",
DROP COLUMN "loading_vocabs_set_count",
DROP COLUMN "vocab_generator_error_messages",
ADD COLUMN     "vocab_gen_done_set_count" INTEGER,
ADD COLUMN     "vocab_gen_error_message" TEXT,
ADD COLUMN     "vocab_gen_scheduled_set_count" INTEGER;
