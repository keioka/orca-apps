-- AlterTable
ALTER TABLE "materials" ALTER COLUMN "image_url" DROP NOT NULL,
ALTER COLUMN "published_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "publishers" ALTER COLUMN "image_url" DROP NOT NULL;
