import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MyTasksContent } from "@/components/tasks/my-tasks-content";

export const dynamic = "force-dynamic";


export default async function MyTasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { assigneeId: session.user.id, status: { not: "DONE" } },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      team: { select: { id: true, name: true, type: true } },
      project: { select: { id: true, name: true } },
      labels: true,
      _count: { select: { subtasks: true, comments: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <MyTasksContent
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() || null,
        projectId: t.project.id,
        projectName: t.project.name,
        team: t.team,
      }))}
    />
  );
}
