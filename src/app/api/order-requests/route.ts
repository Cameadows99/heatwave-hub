import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const requests = await prisma.orderRequest.findMany({
    include: {
      requester: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { items, details, reason } = await req.json();

  const newRequest = await prisma.orderRequest.create({
    data: {
      requesterId: session.user.id,
      items,
      details,
      reason,
    },
  });

  return NextResponse.json(newRequest, { status: 201 });
}
