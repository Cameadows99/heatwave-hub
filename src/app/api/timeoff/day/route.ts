import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO, startOfDay, endOfDay, subDays } from "date-fns";
import type { Prisma } from "@/generated/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) return new NextResponse("date is required", { status: 400 });

  const dayStart = startOfDay(parseISO(dateStr));
  const dayEnd = endOfDay(parseISO(dateStr));
  const denyCutoff = subDays(startOfDay(new Date()), 7);

  const excludeOldDenied: Prisma.TimeOffRequestWhereInput = {
    NOT: {
      AND: [{ status: "DENIED" }, { endDate: { lt: denyCutoff } }],
    },
  };

  const items = await prisma.timeOffRequest.findMany({
    where: {
      AND: [
        { startDate: { lte: dayEnd } },
        { endDate: { gte: dayStart } },
        excludeOldDenied,
      ],
    },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(items);
}
