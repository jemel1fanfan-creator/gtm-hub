"use client";

import { cn, priorityDotColors, formatDate, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { TeamBadge } from "@/components/shared/team-badge";
import { Calendar, FolderKanban } from "lucide-react";

interface MyTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  projectName: string;
  team: { id: string; name: string; type: string } | null;
}

function groupTasks(tasks: MyTask[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(today.getTime() + 7 * 86400000);

  const groups = {
    overdue: [] as MyTask[],
    today: [] as MyTask[],
    thisWeek: [] as MyTask[],
    later: [] as MyTask[],
    noDueDate: [] as MyTask[],
  };

  for (const task of tasks) {
    if (!task.dueDate) {
      groups.noDueDate.push(task);
    } else {
      const due = new Date(task.dueDate);
      if (due < today) groups.overdue.push(task);
      else if (due.toDateString() === today.toDateString()) groups.today.push(task);
      else if (due < endOfWeek) groups.thisWeek.push(task);
      else groups.later.push(task);
    }
  }

  return groups;
}

export function MyTasksContent({ tasks }: { tasks: MyTask[] }) {
  const groups = groupTasks(tasks);

  const sections = [
    { key: "overdue", label: "Overdue", tasks: groups.overdue, color: "text-red-600" },
    { key: "today", label: "Today", tasks: groups.today, color: "text-blue-600" },
    { key: "thisWeek", label: "This Week", tasks: groups.thisWeek, color: "text-gray-900" },
    { key: "later", label: "Later", tasks: groups.later, color: "text-gray-600" },
    { key: "noDueDate", label: "No Due Date", tasks: groups.noDueDate, color: "text-gray-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Tasks</h1>
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm mt-1">No tasks assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) =>
            section.tasks.length > 0 ? (
              <div key={section.key}>
                <h2 className={cn("text-sm font-semibold mb-2", section.color)}>
                  {section.label} ({section.tasks.length})
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {section.tasks.map((task) => (
                    <a
                      key={task.id}
                      href={`/projects/${task.projectId}?task=${task.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <div className={cn("w-2 h-2 rounded-full shrink-0", priorityDotColors[task.priority])} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FolderKanban size={10} />
                            {task.projectName}
                          </span>
                          {task.team && <TeamBadge type={task.team.type} name={task.team.name} />}
                        </div>
                      </div>
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className={cn("text-xs flex items-center gap-1", isOverdue(task.dueDate) ? "text-red-500" : "text-gray-500")}>
                          <Calendar size={12} />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
