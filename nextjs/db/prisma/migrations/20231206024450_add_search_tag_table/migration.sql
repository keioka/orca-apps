-- CreateTable
CREATE TABLE "search_tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "query" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "search_tags_name_key" ON "search_tags"("name");
