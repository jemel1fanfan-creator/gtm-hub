"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, GitBranch } from "lucide-react";
import { cn, priorityDotColors, formatDate, isOverdue } from "@/lib/utils";
import { Avatar } from "@/components/shared/avatar";
import { TeamBadge } from "@/components/shared/team-badge";
import type { TaskItem } from "./kanban-board";

interface TaskCardProps {
  task: TaskItem;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all",
        isDragging && "shadow-lg rotate-2 opacity-90"
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", priorityDotColors[task.priority])} />
        <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {task.team && <TeamBadge type={task.team.type} name={task.team.name} />}
        {task.labels.map((label) => (
          <span
            key={label.id}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ backgroundColor: label.color + "20", color: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task.dueDate && (
            <span className={cn("flex items-center gap-1", isOverdue(task.dueDate) && task.status !== "DONE" && "text-red-500")}>
              <Calendar size={12} />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task._count.subtasks > 0 && (
            <span className="flex items-center gap-1">
              <GitBranch size={12} />
              {task._count.subtasks}
            </span>
          )}
          {task._count.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={12} />
              {task._count.comments}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar name={task.assignee.name} image={task.assignee.image} size="sm" />
        )}
      </div>
    </div>
  );
}

export function SortableTaskCard({ task, onClick }: { task: TaskItem; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
