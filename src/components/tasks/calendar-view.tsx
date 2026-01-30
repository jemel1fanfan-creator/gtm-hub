"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, priorityDotColors } from "@/lib/utils";
import type { TaskItem } from "./kanban-board";
import { TaskDetailPanel } from "./task-detail-panel";

interface CalendarViewProps {
  tasks: TaskItem[];
  projectId: string;
  users: { id: string; name: string; image: string | null }[];
  teams: { id: string; name: string; type: string }[];
  onUpdate: () => void;
}

export function CalendarView({ tasks, projectId, users, teams, onUpdate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function getTasksForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateStr));
  }

  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg">Today</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">{d}</div>
          ))}
          {days.map((day, i) => {
            const dayTasks = day ? getTasksForDay(day) : [];
            return (
              <div key={i} className={cn("min-h-[100px] p-1 border-b border-r border-gray-100", !day && "bg-gray-50")}>
                {day && (
                  <>
                    <span className={cn("inline-flex items-center justify-center w-6 h-6 text-xs rounded-full mb-1", isToday(day) ? "bg-indigo-600 text-white" : "text-gray-700")}>
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[11px] truncate bg-gray-50 hover:bg-gray-100 flex items-center gap-1"
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", priorityDotColors[task.priority])} />
                          {task.title}
                        </button>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-gray-400 pl-1">+{dayTasks.length - 3} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetailPanel taskId={selectedTaskId} projectId={projectId} users={users} teams={teams} onClose={() => setSelectedTaskId(null)} onUpdate={onUpdate} />
      )}
    </>
  );
}
