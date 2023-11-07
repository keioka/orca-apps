-- AlterTable
ALTER TABLE "publishers" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_recommended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "hashtags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_hashtags" (
    "id" SERIAL NOT NULL,
    "material_id" CHAR(36) NOT NULL,
    "hashtag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follow_hashtags" (
    "id" SERIAL NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "hashtag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_follow_hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hashtags_name_key" ON "hashtags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "material_hashtags_material_id_hashtag_id_key" ON "material_hashtags"("material_id", "hashtag_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_follow_hashtags_user_id_hashtag_id_key" ON "user_follow_hashtags"("user_id", "hashtag_id");

-- AddForeignKey
ALTER TABLE "material_hashtags" ADD CONSTRAINT "material_hashtags_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_hashtags" ADD CONSTRAINT "material_hashtags_hashtag_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "hashtags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follow_hashtags" ADD CONSTRAINT "user_follow_hashtags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follow_hashtags" ADD CONSTRAINT "user_follow_hashtags_hashtag_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "hashtags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
