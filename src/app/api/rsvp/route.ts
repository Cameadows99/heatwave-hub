import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function POST(req: Request) {
  const { eventId, name } = await req.json();

  try {
    // ✅ Handle manual RSVP (guest with name only)
    if (name && eventId) {
      const guestRsvp = await prisma.rsvp.create({
        data: {
          eventId,
          name,
          plusCount: 0,
        },
      });
      return NextResponse.json(guestRsvp);
    }

    // ✅ Authenticated user RSVP
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) throw new Error("User not found");

    const existing = await prisma.rsvp.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already reserved this event." },
        { status: 400 }
      );
    }

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

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rsvpId, eventId } = await req.json();

  try {
    if (rsvpId) {
      await prisma.rsvp.delete({
        where: { id: rsvpId },
      });
    } else if (eventId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) throw new Error("User not found");

      await prisma.rsvp.delete({
        where: {
          eventId_userId: {
            eventId,
            userId: user.id,
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Missing identifiers" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("RSVP delete error:", err);
    return NextResponse.json({ error: "Un-RSVP failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  try {
    const rsvps = await prisma.rsvp.findMany({
      where: { eventId },
      select: {
        id: true,
        name: true,
        plusCount: true,
        userId: true,
      },
    });

    return NextResponse.json(rsvps);
  } catch (err) {
    console.error("Fetch RSVPs error:", err);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}
