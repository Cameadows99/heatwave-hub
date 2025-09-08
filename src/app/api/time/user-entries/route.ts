import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const days = Math.max(
    1,
    Math.min(120, Number(url.searchParams.get("days")) || 30)
  );
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const entries = await prisma.timeEntry.findMany({
    where: { userId: session.user.id, clockIn: { gte: from } },
    orderBy: { clockIn: "asc" },
  });

  return NextResponse.json(entries);
}
