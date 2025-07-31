import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Find the most recent clock-in with no clock-out yet
  const latestEntry = await prisma.timeEntry.findFirst({
    where: {
      userId: session.user.id,
      clockOut: null,
    },
    orderBy: {
      clockIn: "desc",
    },
  });

  if (!latestEntry) {
    return new Response("No active clock-in found", { status: 400 });
  }

  // Update it with the current time
  const updatedEntry = await prisma.timeEntry.update({
    where: { id: latestEntry.id },
    data: { clockOut: new Date() },
  });

  return new Response(JSON.stringify(updatedEntry), { status: 200 });
}
