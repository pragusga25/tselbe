/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssignmentRequest" DROP CONSTRAINT "AssignmentRequest_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentRequest" DROP CONSTRAINT "AssignmentRequest_responderId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentUserRequest" DROP CONSTRAINT "AssignmentUserRequest_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentUserRequest" DROP CONSTRAINT "AssignmentUserRequest_responderId_fkey";

-- DropForeignKey
ALTER TABLE "FreezeTime" DROP CONSTRAINT "FreezeTime_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "TimeInHour" DROP CONSTRAINT "TimeInHour_creatorId_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "principalUserId" TEXT,
    "isApprover" BOOLEAN NOT NULL DEFAULT false,
    "isRoot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_principalUserId_key" ON "users"("principalUserId");

-- AddForeignKey
ALTER TABLE "AssignmentRequest" ADD CONSTRAINT "AssignmentRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentRequest" ADD CONSTRAINT "AssignmentRequest_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentUserRequest" ADD CONSTRAINT "AssignmentUserRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentUserRequest" ADD CONSTRAINT "AssignmentUserRequest_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeInHour" ADD CONSTRAINT "TimeInHour_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreezeTime" ADD CONSTRAINT "FreezeTime_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
