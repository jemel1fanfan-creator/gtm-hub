import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, newStatus, newPosition } = await req.json();

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldStatus = task.status;

  // Shift tasks in new column
  await prisma.task.updateMany({
    where: {
      projectId: task.projectId,
      status: newStatus,
      position: { gte: newPosition },
      id: { not: taskId },
    },
    data: { position: { increment: 1 } },
  });

  // Update the moved task
  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus, position: newPosition },
  });

  // Log status change
  if (oldStatus !== newStatus) {
    await prisma.activityLog.create({
      data: {
        action: "updated",
        field: "status",
        oldValue: oldStatus,
        newValue: newStatus,
        taskId,
        userId: session.user.id,
      },
    });
  }

  return NextResponse.json({ success: true });
}
