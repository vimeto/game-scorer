/*
  Warnings:

  - You are about to drop the `_UserToUserGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_UserToUserGroup` DROP FOREIGN KEY `_UserToUserGroup_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserToUserGroup` DROP FOREIGN KEY `_UserToUserGroup_B_fkey`;

-- DropTable
DROP TABLE `_UserToUserGroup`;

-- CreateTable
CREATE TABLE `UserGroupRole` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userGroupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `userInvitationId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInvitation` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserGroupRole` ADD CONSTRAINT `UserGroupRole_userGroupId_fkey` FOREIGN KEY (`userGroupId`) REFERENCES `UserGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserGroupRole` ADD CONSTRAINT `UserGroupRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserGroupRole` ADD CONSTRAINT `UserGroupRole_userInvitationId_fkey` FOREIGN KEY (`userInvitationId`) REFERENCES `UserInvitation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
