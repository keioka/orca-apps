-- AlterTable
ALTER TABLE "feature_flags" ADD COLUMN     "is_release_prod" BOOLEAN NOT NULL DEFAULT false;
