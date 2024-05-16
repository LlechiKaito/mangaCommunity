-- AlterTable
ALTER TABLE `user` ADD COLUMN `password_reset_expires` DATETIME(3) NULL,
    ADD COLUMN `password_reset_token` VARCHAR(191) NULL;
