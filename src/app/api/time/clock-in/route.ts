import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const entry = await prisma.timeEntry.create({
    data: {
      userId,
      clockIn: new Date(),
    },
  });
  return NextResponse.json({ message: "Clocked in", entry });
}
