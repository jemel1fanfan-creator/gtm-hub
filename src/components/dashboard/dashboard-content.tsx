"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, FolderKanban, Clock, TrendingUp } from "lucide-react";
import { statusLabels, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "#94a3b8",
  TODO: "#60a5fa",
  IN_PROGRESS: "#f59e0b",
  IN_REVIEW: "#a78bfa",
  DONE: "#22c55e",
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#3b82f6",
  LOW: "#9ca3af",
};

interface DashboardContentProps {
  totalTasks: number;
  doneTasks: number;
  activeProjects: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  recentActivity: { id: string; action: string; field: string | null; userName: string; taskTitle: string | null; createdAt: string }[];
  upcomingTasks: { id: string; title: string; dueDate: string; assigneeName: string | null; projectName: string }[];
  projects: { id: string; name: string; totalTasks: number; doneTasks: number }[];
}

export function DashboardContent({
  totalTasks,
  doneTasks,
  activeProjects,
  tasksByStatus,
  tasksByPriority,
  recentActivity,
  upcomingTasks,
  projects,
}: DashboardContentProps) {
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const summaryCards = [
    { label: "Total Tasks", value: totalTasks, icon: CheckCircle2, color: "text-blue-600 bg-blue-50" },
    { label: "Completed", value: doneTasks, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Active Projects", value: activeProjects, icon: FolderKanban, color: "text-purple-600 bg-purple-50" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: Clock, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tasksByStatus.map((t) => ({ name: statusLabels[t.status] || t.status, count: t.count, fill: STATUS_COLORS[t.status] || "#6366f1" }))}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {tasksByStatus.map((t, i) => (
                  <Cell key={i} fill={STATUS_COLORS[t.status] || "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tasksByPriority.map((t) => ({ name: t.priority, value: t.count }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
              >
                {tasksByPriority.map((t, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[t.priority] || "#6366f1"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-4">Upcoming Deadlines</h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No upcoming deadlines</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.projectName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(task.dueDate)}</p>
                    {task.assigneeName && <p className="text-xs text-gray-400">{task.assigneeName}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.userName}</span>{" "}
                      {activity.action}
                      {activity.field && ` ${activity.field}`}
                      {activity.taskTitle && (
                        <> on <span className="font-medium">{activity.taskTitle}</span></>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold mb-4">Project Progress</h2>
        <div className="space-y-4">
          {projects.map((project) => {
            const pct = project.totalTasks > 0 ? Math.round((project.doneTasks / project.totalTasks) * 100) : 0;
            return (
              <div key={project.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-gray-500">{project.doneTasks}/{project.totalTasks} tasks ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
