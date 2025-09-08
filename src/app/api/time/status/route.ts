import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId)
    return Response.json({
      clockedIn: false,
      activeEntryId: null,
      since: null,
    });

  const open = await prisma.timeEntry.findFirst({
    where: { userId, clockOut: null },
    orderBy: { clockIn: "desc" },
    select: { id: true, clockIn: true },
  });

  return Response.json({
    clockedIn: !!open,
    activeEntryId: open?.id ?? null,
    since: open?.clockIn ?? null,
  });
}
