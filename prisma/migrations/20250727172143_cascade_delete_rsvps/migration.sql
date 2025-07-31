-- DropForeignKey
ALTER TABLE "Rsvp" DROP CONSTRAINT "Rsvp_eventId_fkey";

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
