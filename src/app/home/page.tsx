// src/app/home/page.tsx  (SERVER component)
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  let initialClockedIn = false;
  if (userId) {
    const open = await prisma.timeEntry.findFirst({
      where: { userId, clockOut: null },
      select: { id: true },
    });
    initialClockedIn = !!open;
  }

  return <HomeClient initialClockedIn={initialClockedIn} />;
}
