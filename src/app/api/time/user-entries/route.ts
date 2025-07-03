import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const threeMonthsAgo = subMonths(new Date(), 3);

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId,
      clockIn: {
        gte: threeMonthsAgo,
      },
    },
    orderBy: {
      clockIn: "asc",
    },
  });

  return NextResponse.json({ entries });
}
