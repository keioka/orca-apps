-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "loading_vocabs_done_set_count" INTEGER,
ADD COLUMN     "loading_vocabs_set_count" INTEGER,
ADD COLUMN     "vocab_generator_error_messages" TEXT;
