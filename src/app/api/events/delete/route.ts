import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { title, date } = await req.json();

  await prisma.event.deleteMany({
    where: {
      title,
      date,
    },
  });

  return NextResponse.json({ success: true });
}
