import { prisma } from "@/lib/prisma";
import { TeamsContent } from "@/components/teams/teams-content";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
      _count: { select: { tasks: true, projects: true } },
    },
  });

  return (
    <TeamsContent
      teams={teams.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        color: t.color,
        description: t.description,
        members: t.members.map((m) => ({ ...m.user, role: m.role })),
        taskCount: t._count.tasks,
        projectCount: t._count.projects,
      }))}
    />
  );
}
