import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      teams: { include: { team: true } },
      _count: { select: { tasks: true } },
      tasks: { where: { status: "DONE" }, select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    projects.map((p) => ({
      ...p,
      totalTasks: p._count.tasks,
      doneTasks: p.tasks.length,
      tasks: undefined,
      _count: undefined,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description || null,
      status: body.status || "ACTIVE",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      teams: body.teamIds?.length
        ? { create: body.teamIds.map((teamId: string) => ({ teamId })) }
        : undefined,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
