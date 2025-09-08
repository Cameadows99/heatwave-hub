import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // ensure no open entry
  const open = await prisma.timeEntry.findFirst({
    where: { userId, clockOut: null },
  });
  if (open)
    return NextResponse.json({ error: "Already clocked in" }, { status: 400 });

  const entry = await prisma.timeEntry.create({
    data: { userId, clockIn: new Date(), source: "APP" },
  });

  return NextResponse.json(entry);
}
