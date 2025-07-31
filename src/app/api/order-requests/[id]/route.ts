import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DELETE: remove a request
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const deleted = await prisma.orderRequest.delete({
    where: { id: params.id },
  });

  return NextResponse.json(deleted);
}

// PATCH: mark as ordered
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const updated = await prisma.orderRequest.update({
    where: { id: params.id },
    data: { ordered: true },
  });

  return NextResponse.json(updated);
}
