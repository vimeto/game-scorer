/*
  Warnings:

  - A unique constraint covering the columns `[emailHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_emailHash_key` ON `User`(`emailHash`);
