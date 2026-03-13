import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// DELETE: remove a request
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({ id });
}

// PATCH: mark as ordered
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const updated = await prisma.orderRequest.update({
    where: { id },
    data: { ordered: true },
  });

  return NextResponse.json(updated);
}
