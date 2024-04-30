/*
  Warnings:

  - A unique constraint covering the columns `[work_id]` on the table `Work_image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `work` MODIFY `explanation` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Work_image_work_id_key` ON `Work_image`(`work_id`);
