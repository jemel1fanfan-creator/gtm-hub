import { prisma } from "@/lib/prisma";
import { ProjectList } from "@/components/projects/project-list";

export const dynamic = "force-dynamic";


export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      teams: { include: { team: true } },
      _count: { select: { tasks: true } },
      tasks: { where: { status: "DONE" }, select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <ProjectList
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        teams: p.teams.map((pt) => pt.team),
        totalTasks: p._count.tasks,
        doneTasks: p.tasks.length,
        updatedAt: p.updatedAt.toISOString(),
      }))}
    />
  );
}
