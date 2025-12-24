/*
  Warnings:

  - You are about to drop the column `meta_data` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `resource_id` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `user_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,topic_id]` on the table `user_progress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_resource_id_fkey";

-- DropIndex
DROP INDEX "user_progress_user_id_resource_id_key";

-- AlterTable
ALTER TABLE "user_progress" DROP COLUMN "meta_data",
DROP COLUMN "resource_id",
DROP COLUMN "status",
ADD COLUMN     "is_topic_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdf_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quiz_passed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quiz_score" INTEGER,
ADD COLUMN     "video_completed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_topic_id_key" ON "user_progress"("user_id", "topic_id");
