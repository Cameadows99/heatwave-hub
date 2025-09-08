import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const open = await prisma.timeEntry.findFirst({
    where: { userId, clockOut: null },
  });
  if (!open)
    return NextResponse.json({ error: "No open entry" }, { status: 400 });

  const entry = await prisma.timeEntry.update({
    where: { id: open.id },
    data: { clockOut: new Date() },
  });

  return NextResponse.json(entry);
}
