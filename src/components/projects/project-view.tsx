"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanBoard, TaskItem } from "@/components/tasks/kanban-board";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskFilters } from "@/components/tasks/task-filters";
import { CalendarView } from "@/components/tasks/calendar-view";
import { TeamBadge } from "@/components/shared/team-badge";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";

interface ProjectViewProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    teams: { id: string; name: string; type: string }[];
  };
  tasks: TaskItem[];
  users: { id: string; name: string; image: string | null }[];
  teams: { id: string; name: string; type: string }[];
}

type ViewMode = "board" | "list" | "calendar";

export function ProjectView({ project, tasks, users, teams }: ProjectViewProps) {
  const [view, setView] = useState<ViewMode>("board");
  const [showNewTask, setShowNewTask] = useState(false);
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  const views = [
    { key: "board" as const, icon: LayoutGrid, label: "Board" },
    { key: "list" as const, icon: List, label: "List" },
    { key: "calendar" as const, icon: Calendar, label: "Calendar" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {project.teams.map((team) => (
              <TeamBadge key={team.id} type={team.type} name={team.name} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {views.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition",
                  view === v.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <v.icon size={14} />
                {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="mb-4">
        <TaskFilters users={users} teams={teams} />
      </div>

      <div className="flex-1 min-h-0">
        {view === "board" && (
          <KanbanBoard
            tasks={tasks}
            projectId={project.id}
            users={users}
            teams={teams}
            onUpdate={refresh}
          />
        )}
        {view === "list" && (
          <TaskListView
            tasks={tasks}
            projectId={project.id}
            users={users}
            teams={teams}
            onUpdate={refresh}
            selectable
          />
        )}
        {view === "calendar" && (
          <CalendarView tasks={tasks} projectId={project.id} users={users} teams={teams} onUpdate={refresh} />
        )}
      </div>

      {showNewTask && (
        <NewTaskDialog
          projectId={project.id}
          users={users}
          teams={teams}
          onClose={() => setShowNewTask(false)}
          onCreated={() => { setShowNewTask(false); refresh(); }}
        />
      )}
    </div>
  );
}
