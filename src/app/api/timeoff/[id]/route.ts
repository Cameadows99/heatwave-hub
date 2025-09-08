import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";

// PATCH /api/timeoff/:id
// body: { status: "PENDING" | "APPROVED" | "DENIED" }
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as string | undefined;
  if (!role || !["ADMIN", "MANAGER"].includes(role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status = body?.status as "PENDING" | "APPROVED" | "DENIED" | undefined;
  if (!status) return new NextResponse("Missing status", { status: 400 });

  const updated = await prisma.timeOffRequest.update({
    where: { id: params.id },
    data: { status },
    include: { user: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/timeoff/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const target = await prisma.timeOffRequest.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });
  if (!target) return new NextResponse("Not found", { status: 404 });

  const isOwner = target.userId === session.user.id;
  const role = session.user.role as string | undefined;
  const isPriv = !!role && ["ADMIN", "MANAGER"].includes(role);

  if (!isOwner && !isPriv)
    return new NextResponse("Forbidden", { status: 403 });

  await prisma.timeOffRequest.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
