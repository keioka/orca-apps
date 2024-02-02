-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_audio_file_id_fkey" FOREIGN KEY ("audio_file_id") REFERENCES "audio_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
