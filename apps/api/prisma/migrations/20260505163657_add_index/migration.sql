/*
  Warnings:

  - A unique constraint covering the columns `[userId,deviceId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spaceId,userId]` on the table `SpaceMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RefreshToken_userId_idx";

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_deviceId_key" ON "RefreshToken"("userId", "deviceId");

-- CreateIndex
CREATE INDEX "Source_messageId_idx" ON "Source"("messageId");

-- CreateIndex
CREATE INDEX "SpaceMember_spaceId_idx" ON "SpaceMember"("spaceId");

-- CreateIndex
CREATE INDEX "SpaceMember_userId_idx" ON "SpaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceMember_spaceId_userId_key" ON "SpaceMember"("spaceId", "userId");

-- CreateIndex
CREATE INDEX "chat_userId_createdAt_idx" ON "chat"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "message_userId_createdAt_idx" ON "message"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "message_chatId_createdAt_idx" ON "message"("chatId", "createdAt");
