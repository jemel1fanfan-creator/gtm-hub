import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, content } = await req.json();
  if (!taskId || !content) return NextResponse.json({ error: "taskId and content required" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { taskId, content, userId: session.user.id },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  await prisma.activityLog.create({
    data: { action: "commented", taskId, userId: session.user.id },
  });

  return NextResponse.json(comment, { status: 201 });
}
