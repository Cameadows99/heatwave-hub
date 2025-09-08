-- CreateEnum
CREATE TYPE "TimeSource" AS ENUM ('APP', 'ADMIN_EDIT', 'IMPORT');

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_userId_fkey";

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "adjustmentM" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "editedById" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "source" "TimeSource" NOT NULL DEFAULT 'APP';

-- CreateIndex
CREATE INDEX "TimeEntry_userId_clockIn_idx" ON "TimeEntry"("userId", "clockIn");

-- CreateIndex
CREATE INDEX "TimeEntry_editedById_idx" ON "TimeEntry"("editedById");

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
