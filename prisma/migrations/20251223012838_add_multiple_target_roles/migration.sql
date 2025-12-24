/*
  Warnings:

  - You are about to drop the column `target_role_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_target_role_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "target_role_id";

-- CreateTable
CREATE TABLE "_JobRoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JobRoleToUser_AB_unique" ON "_JobRoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_JobRoleToUser_B_index" ON "_JobRoleToUser"("B");

-- AddForeignKey
ALTER TABLE "_JobRoleToUser" ADD CONSTRAINT "_JobRoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "job_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobRoleToUser" ADD CONSTRAINT "_JobRoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
