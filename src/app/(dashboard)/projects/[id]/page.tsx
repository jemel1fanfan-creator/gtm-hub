import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/projects/project-view";

export const dynamic = "force-dynamic";


export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      teams: { include: { team: true } },
      tasks: {
        where: { parentId: null },
        include: {
          assignee: { select: { id: true, name: true, image: true } },
          team: { select: { id: true, name: true, type: true } },
          labels: true,
          _count: { select: { subtasks: true, comments: true } },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!project) notFound();

  const [allUsers, allTeams] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, image: true } }),
    prisma.team.findMany({ select: { id: true, name: true, type: true } }),
  ]);

  return (
    <ProjectView
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        teams: project.teams.map((pt) => pt.team),
      }}
      tasks={project.tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate?.toISOString() || null,
      }))}
      users={allUsers}
      teams={allTeams}
    />
  );
}
