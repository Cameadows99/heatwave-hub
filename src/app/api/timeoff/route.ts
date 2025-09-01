// app/api/timeoff/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO, startOfDay, endOfDay, subDays } from "date-fns";
import type { Prisma } from "@/generated/prisma";
import { getAuthSession } from "@/lib/auth"; // same helper you use in [id]/route.ts

// Helper: convert "yyyy-MM-dd" (from <input type="date">) to a *local* midnight Date
function localYmdToDate(ymd: string) {
  const [y, m, d] = (ymd ?? "").split("-").map(Number);
  if (!y || !m || !d) return new Date(NaN);
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const startDateStr = body?.startDate as string | undefined; // e.g. "2025-08-24"
    const endDateStr = body?.endDate as string | undefined;
    const reason = (body?.reason as string | undefined)?.trim();

    if (!startDateStr || !endDateStr || !reason) {
      return new NextResponse("Missing startDate, endDate, or reason", {
        status: 400,
      });
    }

    const startDate = localYmdToDate(startDateStr);
    const endDate = localYmdToDate(endDateStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return new NextResponse("Invalid date format; expected yyyy-MM-dd", {
        status: 400,
      });
    }
    if (endDate < startDate) {
      return new NextResponse("endDate cannot be before startDate", {
        status: 400,
      });
    }

    const created = await prisma.timeOffRequest.create({
      data: {
        userId: session.user.id,
        reason,
        status: "PENDING",
        startDate,
        endDate,
      },
      include: { user: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/timeoff error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

// (your existing GET stays as-is)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const today = startOfDay(new Date());
  const denyCutoff = subDays(today, 7);

  const excludeOldDenied: Prisma.TimeOffRequestWhereInput = {
    NOT: {
      AND: [{ status: "DENIED" }, { endDate: { lt: denyCutoff } }],
    },
  };

  if (from && to) {
    const fromDate = startOfDay(parseISO(from));
    const toDate = endOfDay(parseISO(to));
    const items = await prisma.timeOffRequest.findMany({
      where: {
        AND: [
          { startDate: { lte: toDate } },
          { endDate: { gte: fromDate } },
          excludeOldDenied,
        ],
      },
      include: { user: true },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(items);
  }

  const items = await prisma.timeOffRequest.findMany({
    where: { AND: [{ endDate: { gte: today } }, excludeOldDenied] },
    include: { user: true },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(items);
}
