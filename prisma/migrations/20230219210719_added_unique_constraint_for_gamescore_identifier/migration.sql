/*
  Warnings:

  - A unique constraint covering the columns `[gameId,userId,identifier]` on the table `GameScore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `GameScore_gameId_userId_identifier_key` ON `GameScore`(`gameId`, `userId`, `identifier`);
