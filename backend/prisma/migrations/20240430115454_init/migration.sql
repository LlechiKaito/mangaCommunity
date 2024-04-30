/*
  Warnings:

  - You are about to drop the `workimage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `workimage` DROP FOREIGN KEY `WorkImage_work_id_fkey`;

-- DropTable
DROP TABLE `workimage`;

-- CreateTable
CREATE TABLE `Work_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `work_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Work_image` ADD CONSTRAINT `Work_image_work_id_fkey` FOREIGN KEY (`work_id`) REFERENCES `Work`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
