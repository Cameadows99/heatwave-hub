import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST() {
  const session = await getAuthSession();
  console.log("SESSION: ", session);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const timeEntry = await prisma.timeEntry.create({
    data: {
      userId: session.user.id, // this must match a real User.id in the DB
      clockIn: new Date(),
    },
  });

  return new Response(JSON.stringify(timeEntry), { status: 200 });
}
