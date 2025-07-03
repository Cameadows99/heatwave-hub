import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const openEntry = await prisma.timeEntry.findFirst({
    where: {
      userId,
      clockOut: null,
    },
    orderBy: {
      clockIn: "desc",
    },
  });

  if (!openEntry) {
    return NextResponse.json(
      { error: "No open clock-in found" },
      { status: 404 }
    );
  }

  const updated = await prisma.timeEntry.update({
    where: {
      id: openEntry.id,
    },
    data: {
      clockOut: new Date(),
    },
  });

  return NextResponse.json({ message: "Clocked out", entry: updated });
}
