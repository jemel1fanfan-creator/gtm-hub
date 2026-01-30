import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const [tasksByStatus, tasksByPriority, recentActivity, upcomingTasks, projects] = await Promise.all([
    prisma.task.groupBy({ by: ["status"], _count: true }),
    prisma.task.groupBy({ by: ["priority"], _count: true }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, image: true } }, task: { select: { title: true } } },
    }),
    prisma.task.findMany({
      where: {
        dueDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) },
        status: { not: "DONE" },
      },
      take: 10,
      orderBy: { dueDate: "asc" },
      include: { assignee: { select: { name: true, image: true } }, project: { select: { name: true } } },
    }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      include: { _count: { select: { tasks: true } }, tasks: { where: { status: "DONE" }, select: { id: true } } },
    }),
  ]);

  const totalTasks = tasksByStatus.reduce((sum, t) => sum + t._count, 0);
  const doneTasks = tasksByStatus.find((t) => t.status === "DONE")?._count || 0;

  return (
    <DashboardContent
      totalTasks={totalTasks}
      doneTasks={doneTasks}
      activeProjects={projects.length}
      tasksByStatus={tasksByStatus.map((t) => ({ status: t.status, count: t._count }))}
      tasksByPriority={tasksByPriority.map((t) => ({ priority: t.priority, count: t._count }))}
      recentActivity={recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        field: a.field,
        userName: a.user.name,
        taskTitle: a.task?.title || null,
        createdAt: a.createdAt.toISOString(),
      }))}
      upcomingTasks={upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate!.toISOString(),
        assigneeName: t.assignee?.name || null,
        projectName: t.project.name,
      }))}
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        totalTasks: p._count.tasks,
        doneTasks: p.tasks.length,
      }))}
    />
  );
}
