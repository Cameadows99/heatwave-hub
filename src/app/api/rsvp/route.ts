// /api/rsvp/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, userId, name, plusCount } = await req.json();

  const existing = await prisma.rsvp.findFirst({
    where: {
      eventId,
      userId,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "No one can come twice that fast" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) throw new Error("User not found");

    const rsvp = await prisma.rsvp.create({
      data: {
        userId: user.id,
        name: user.name,
        eventId,
        plusCount: 0,
      },
    });

    return NextResponse.json(rsvp);
  } catch (err) {
    console.error("RSVP error:", err);
    return NextResponse.json({ error: "RSVP failed" }, { status: 500 });
  }
}
