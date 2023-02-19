/*
  Warnings:

  - You are about to alter the column `identifier` on the `GameScore` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `GameScore` MODIFY `identifier` INTEGER NOT NULL;
