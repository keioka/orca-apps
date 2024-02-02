-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "audio_file_id" INTEGER;

-- CreateTable
CREATE TABLE "audio_files" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audio_files_path_key" ON "audio_files"("path");
