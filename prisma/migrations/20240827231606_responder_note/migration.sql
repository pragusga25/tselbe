/*
  Warnings:

  - You are about to drop the column `note` on the `AssignmentRequest` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `AssignmentUserRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssignmentRequest" DROP COLUMN "note",
ADD COLUMN     "requester_note" TEXT,
ADD COLUMN     "responder_note" TEXT;

-- AlterTable
ALTER TABLE "AssignmentUserRequest" DROP COLUMN "note",
ADD COLUMN     "requester_note" TEXT,
ADD COLUMN     "responder_note" TEXT;
