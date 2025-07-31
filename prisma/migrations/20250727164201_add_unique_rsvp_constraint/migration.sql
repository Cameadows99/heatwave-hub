/*
  Warnings:

  - A unique constraint covering the columns `[eventId,userId]` on the table `Rsvp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_eventId_userId_key" ON "Rsvp"("eventId", "userId");
