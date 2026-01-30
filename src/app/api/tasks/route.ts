import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const assigneeId = searchParams.get("assigneeId");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const teamId = searchParams.get("teamId");

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (teamId) where.teamId = teamId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      team: { select: { id: true, name: true, type: true } },
      labels: true,
      _count: { select: { subtasks: true, comments: true } },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const maxPos = await prisma.task.aggregate({
    where: { projectId: body.projectId, status: body.status || "TODO" },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      status: body.status || "TODO",
      priority: body.priority || "MEDIUM",
      position: (maxPos._max.position ?? -1) + 1,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      projectId: body.projectId,
      assigneeId: body.assigneeId || null,
      creatorId: session.user.id,
      teamId: body.teamId || null,
      parentId: body.parentId || null,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      team: { select: { id: true, name: true, type: true } },
      labels: true,
      _count: { select: { subtasks: true, comments: true } },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "created",
      taskId: task.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
