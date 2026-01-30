import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const password = await bcrypt.hash("password123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gtmhub.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@gtmhub.com",
      password,
      role: "ADMIN",
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@gtmhub.com" },
    update: {},
    create: { name: "Sarah Chen", email: "sarah@gtmhub.com", password, role: "MANAGER" },
  });

  const mike = await prisma.user.upsert({
    where: { email: "mike@gtmhub.com" },
    update: {},
    create: { name: "Mike Johnson", email: "mike@gtmhub.com", password, role: "MEMBER" },
  });

  const emily = await prisma.user.upsert({
    where: { email: "emily@gtmhub.com" },
    update: {},
    create: { name: "Emily Davis", email: "emily@gtmhub.com", password, role: "MEMBER" },
  });

  // Create teams
  const marketing = await prisma.team.upsert({
    where: { id: "marketing-team" },
    update: {},
    create: { id: "marketing-team", name: "Marketing", type: "MARKETING", color: "#9333ea", description: "Brand, content, and demand generation" },
  });

  const sales = await prisma.team.upsert({
    where: { id: "sales-team" },
    update: {},
    create: { id: "sales-team", name: "Sales", type: "SALES", color: "#16a34a", description: "Pipeline and revenue generation" },
  });

  const cs = await prisma.team.upsert({
    where: { id: "cs-team" },
    update: {},
    create: { id: "cs-team", name: "Customer Success", type: "CUSTOMER_SUCCESS", color: "#d97706", description: "Retention and expansion" },
  });

  // Add team members
  for (const { userId, teamId, role } of [
    { userId: admin.id, teamId: marketing.id, role: "ADMIN" as const },
    { userId: sarah.id, teamId: marketing.id, role: "MANAGER" as const },
    { userId: mike.id, teamId: sales.id, role: "MEMBER" as const },
    { userId: emily.id, teamId: cs.id, role: "MEMBER" as const },
    { userId: sarah.id, teamId: sales.id, role: "MEMBER" as const },
  ]) {
    await prisma.teamMember.upsert({
      where: { userId_teamId: { userId, teamId } },
      update: {},
      create: { userId, teamId, role },
    });
  }

  // Create project
  const project = await prisma.project.upsert({
    where: { id: "q1-launch" },
    update: {},
    create: {
      id: "q1-launch",
      name: "Q1 Product Launch",
      description: "Cross-functional launch campaign for the new enterprise tier",
      status: "ACTIVE",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-03-31"),
    },
  });

  // Link teams to project
  for (const teamId of [marketing.id, sales.id, cs.id]) {
    await prisma.projectTeam.upsert({
      where: { projectId_teamId: { projectId: project.id, teamId } },
      update: {},
      create: { projectId: project.id, teamId },
    });
  }

  // Create sample tasks
  const tasks = [
    { title: "Design landing page mockups", status: "DONE" as const, priority: "HIGH" as const, assigneeId: sarah.id, teamId: marketing.id, dueDate: new Date("2026-02-01") },
    { title: "Write product launch blog post", status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, assigneeId: sarah.id, teamId: marketing.id, dueDate: new Date("2026-02-10") },
    { title: "Create sales enablement deck", status: "TODO" as const, priority: "HIGH" as const, assigneeId: mike.id, teamId: sales.id, dueDate: new Date("2026-02-15") },
    { title: "Prepare demo environment", status: "IN_PROGRESS" as const, priority: "URGENT" as const, assigneeId: mike.id, teamId: sales.id, dueDate: new Date("2026-02-05") },
    { title: "Draft customer migration guide", status: "TODO" as const, priority: "MEDIUM" as const, assigneeId: emily.id, teamId: cs.id, dueDate: new Date("2026-02-20") },
    { title: "Set up webinar registration", status: "BACKLOG" as const, priority: "LOW" as const, assigneeId: sarah.id, teamId: marketing.id, dueDate: new Date("2026-03-01") },
    { title: "Update pricing page", status: "IN_REVIEW" as const, priority: "HIGH" as const, assigneeId: admin.id, teamId: marketing.id, dueDate: new Date("2026-02-08") },
    { title: "Train CS team on new features", status: "TODO" as const, priority: "MEDIUM" as const, assigneeId: emily.id, teamId: cs.id, dueDate: new Date("2026-02-25") },
    { title: "Create email drip campaign", status: "BACKLOG" as const, priority: "MEDIUM" as const, assigneeId: sarah.id, teamId: marketing.id, dueDate: new Date("2026-03-05") },
    { title: "Competitive analysis report", status: "TODO" as const, priority: "LOW" as const, assigneeId: mike.id, teamId: sales.id, dueDate: new Date("2026-02-28") },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    await prisma.task.upsert({
      where: { id: `task-${i + 1}` },
      update: {},
      create: {
        id: `task-${i + 1}`,
        title: t.title,
        status: t.status,
        priority: t.priority,
        position: i,
        dueDate: t.dueDate,
        projectId: project.id,
        assigneeId: t.assigneeId,
        creatorId: admin.id,
        teamId: t.teamId,
      },
    });
  }

  // Add some activity
  await prisma.activityLog.create({
    data: { action: "created", taskId: "task-1", userId: admin.id },
  });
  await prisma.activityLog.create({
    data: { action: "updated", field: "status", oldValue: "TODO", newValue: "IN_PROGRESS", taskId: "task-2", userId: sarah.id },
  });
  await prisma.activityLog.create({
    data: { action: "commented", taskId: "task-4", userId: mike.id },
  });

  // Add a comment
  await prisma.comment.create({
    data: {
      content: "Demo environment is almost ready. Just need to load sample data.",
      taskId: "task-4",
      userId: mike.id,
    },
  });

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
