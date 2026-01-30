"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn, statusLabels, formatDate, isOverdue, priorityDotColors } from "@/lib/utils";
import { Avatar } from "@/components/shared/avatar";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { TeamBadge } from "@/components/shared/team-badge";
import { TaskDetailPanel } from "./task-detail-panel";
import type { TaskItem } from "./kanban-board";

interface TaskListViewProps {
  tasks: TaskItem[];
  projectId: string;
  users: { id: string; name: string; image: string | null }[];
  teams: { id: string; name: string; type: string }[];
  onUpdate: () => void;
  selectable?: boolean;
}

type SortKey = "title" | "status" | "priority" | "dueDate" | "assignee";

export function TaskListView({ tasks, projectId, users, teams, onUpdate, selectable }: TaskListViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    }
  }

  async function bulkAction(action: "delete" | string, value?: string) {
    const ids = Array.from(selectedIds);
    if (action === "delete") {
      if (!confirm(`Delete ${ids.length} tasks?`)) return;
      await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}`, { method: "DELETE" })));
    } else {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [action]: value }),
          })
        )
      );
    }
    setSelectedIds(new Set());
    onUpdate();
  }

  const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const statusOrder: Record<string, number> = { BACKLOG: 0, TODO: 1, IN_PROGRESS: 2, IN_REVIEW: 3, DONE: 4 };

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "title": cmp = a.title.localeCompare(b.title); break;
      case "status": cmp = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0); break;
      case "priority": cmp = (priorityOrder[a.priority] ?? 0) - (priorityOrder[b.priority] ?? 0); break;
      case "dueDate": cmp = (a.dueDate || "z").localeCompare(b.dueDate || "z"); break;
      case "assignee": cmp = (a.assignee?.name || "z").localeCompare(b.assignee?.name || "z"); break;
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
      {label}
      <ArrowUpDown size={12} className={sortKey === field ? "text-indigo-500" : ""} />
    </button>
  );

  return (
    <>
      {selectable && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-3 p-2 bg-indigo-50 rounded-lg">
          <span className="text-sm font-medium text-indigo-700">{selectedIds.size} selected</span>
          <select
            onChange={(e) => { if (e.target.value) bulkAction("status", e.target.value); e.target.value = ""; }}
            className="text-sm border rounded px-2 py-1"
            defaultValue=""
          >
            <option value="" disabled>Move to...</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            onChange={(e) => { if (e.target.value) bulkAction("assigneeId", e.target.value); e.target.value = ""; }}
            className="text-sm border rounded px-2 py-1"
            defaultValue=""
          >
            <option value="" disabled>Assign to...</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button onClick={() => bulkAction("delete")} className="text-sm text-red-600 hover:text-red-700 font-medium ml-auto">
            Delete
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_120px_100px_120px_100px] gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          {selectable && (
            <input type="checkbox" checked={selectedIds.size === tasks.length && tasks.length > 0} onChange={toggleAll} className="mt-0.5" />
          )}
          <SortHeader label="Task" field="title" />
          <SortHeader label="Status" field="status" />
          <SortHeader label="Priority" field="priority" />
          <SortHeader label="Due Date" field="dueDate" />
          <SortHeader label="Assignee" field="assignee" />
        </div>

        {sorted.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTaskId(task.id)}
            className="grid grid-cols-[auto_1fr_120px_100px_120px_100px] gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer items-center"
          >
            {selectable && (
              <input
                type="checkbox"
                checked={selectedIds.has(task.id)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(task.id); }}
              />
            )}
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn("w-2 h-2 rounded-full shrink-0", priorityDotColors[task.priority])} />
              <span className="text-sm font-medium truncate">{task.title}</span>
              {task.team && <TeamBadge type={task.team.type} name={task.team.name} />}
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-center">
              {statusLabels[task.status]}
            </span>
            <PriorityBadge priority={task.priority} />
            <span className={cn("text-xs", task.dueDate && isOverdue(task.dueDate) && task.status !== "DONE" ? "text-red-500 font-medium" : "text-gray-500")}>
              {task.dueDate ? formatDate(task.dueDate) : "—"}
            </span>
            <div>
              {task.assignee ? (
                <Avatar name={task.assignee.name} image={task.assignee.image} size="sm" />
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">No tasks found</div>
        )}
      </div>

      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          projectId={projectId}
          users={users}
          teams={teams}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
