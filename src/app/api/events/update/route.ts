import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const updated = await prisma.event.updateMany({
    where: {
      title: body.originalTitle,
      date: body.originalDate,
    },
    data: {
      title: body.title,
      time: body.time,
      location: body.location,
      description: body.description,
    },
  });

  return NextResponse.json({ success: true, updated });
}
