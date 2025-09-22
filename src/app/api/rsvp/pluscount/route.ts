import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rsvpId, delta } = await req.json();

  if (!rsvpId || typeof delta !== "number") {
    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.rsvp.update({
      where: { id: rsvpId },
      data: {
        plusCount: {
          increment: delta,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PlusCount update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
