/*
  Warnings:

  - You are about to drop the column `block_id` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the `course_blocks` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resource_id` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "course_blocks" DROP CONSTRAINT "course_blocks_course_id_fkey";

-- DropForeignKey
ALTER TABLE "course_blocks" DROP CONSTRAINT "course_blocks_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_block_id_fkey";

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "block_id",
ADD COLUMN     "resource_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "course_blocks";

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "topic_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
