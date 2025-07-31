import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();

  const created = await prisma.event.create({
    data: {
      title: body.title,
      date: body.date,
      time: body.time,
      location: body.location,
      description: body.description,
      attendees: body.attendees ?? [],
    },
  });

  return NextResponse.json(created);
}
