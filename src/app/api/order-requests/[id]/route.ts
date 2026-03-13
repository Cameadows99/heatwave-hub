import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const rsvps = await prisma.rsvp.findMany({
      where: { userId },
      select: { eventId: true },
    });

    return NextResponse.json(rsvps);
  } catch (err) {
    console.error("Failed to fetch RSVPs:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
