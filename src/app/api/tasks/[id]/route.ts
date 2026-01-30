import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      team: { select: { id: true, name: true, type: true } },
      labels: true,
      subtasks: {
        include: { assignee: { select: { id: true, name: true, image: true } } },
        orderBy: { position: "asc" },
      },
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { subtasks: true, comments: true } },
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const oldTask = await prisma.task.findUnique({ where: { id: params.id } });
  if (!oldTask) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) data.status = body.status;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.position !== undefined) data.position = body.position;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId || null;
  if (body.teamId !== undefined) data.teamId = body.teamId || null;
  if (body.parentId !== undefined) data.parentId = body.parentId || null;

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      team: { select: { id: true, name: true, type: true } },
      labels: true,
      _count: { select: { subtasks: true, comments: true } },
    },
  });

  // Log changes
  const fieldsToTrack = ["status", "priority", "assigneeId", "title"];
  for (const field of fieldsToTrack) {
    if (body[field] !== undefined && String(body[field]) !== String((oldTask as Record<string, unknown>)[field])) {
      await prisma.activityLog.create({
        data: {
          action: "updated",
          field,
          oldValue: String((oldTask as Record<string, unknown>)[field] ?? ""),
          newValue: String(body[field] ?? ""),
          taskId: params.id,
          userId: session.user.id,
        },
      });
    }
  }

  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
