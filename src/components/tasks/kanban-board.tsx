"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { statusColumns, statusLabels } from "@/lib/utils";
import { TaskCard, SortableTaskCard } from "./task-card";
import { TaskDetailPanel } from "./task-detail-panel";
import { Plus } from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  dueDate: string | null;
  assignee: { id: string; name: string; image: string | null } | null;
  team: { id: string; name: string; type: string } | null;
  labels: { id: string; name: string; color: string }[];
  _count: { subtasks: number; comments: number };
}

interface KanbanBoardProps {
  tasks: TaskItem[];
  projectId: string;
  users: { id: string; name: string; image: string | null }[];
  teams: { id: string; name: string; type: string }[];
  onUpdate: () => void;
}

export function KanbanBoard({ tasks, projectId, users, teams, onUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Sync when tasks prop changes
  if (JSON.stringify(tasks.map(t => t.id + t.status)) !== JSON.stringify(localTasks.map(t => t.id + t.status))) {
    setLocalTasks(tasks);
  }

  const getColumnTasks = useCallback(
    (status: string) => localTasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position),
    [localTasks]
  );

  function handleDragStart(event: DragStartEvent) {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = localTasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    // Check if dropping over a column
    const overColumn = statusColumns.find((s) => s === overId);
    const overTask = localTasks.find((t) => t.id === overId);
    const newStatus = overColumn || overTask?.status;

    if (newStatus && newStatus !== activeTaskItem.status) {
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: newStatus } : t
        )
      );
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    const columnTasks = getColumnTasks(task.status);
    const newPosition = columnTasks.findIndex((t) => t.id === taskId);

    await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        newStatus: task.status,
        newPosition: Math.max(0, newPosition),
      }),
    });

    onUpdate();
  }

  async function handleQuickAdd(status: string) {
    const title = prompt("Task title:");
    if (!title?.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), projectId, status }),
    });
    onUpdate();
  }

  const selectedTask = localTasks.find((t) => t.id === selectedTaskId) || null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {statusColumns.map((status) => {
            const columnTasks = getColumnTasks(status);
            return (
              <div
                key={status}
                className="flex-shrink-0 w-72 bg-gray-100 rounded-xl flex flex-col"
              >
                <div className="px-3 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {statusLabels[status]}
                    </h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(status)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <SortableContext
                  id={status}
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[100px]">
                    {columnTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTaskId(task.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} onClick={() => {}} isDragging />}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailPanel
          taskId={selectedTask.id}
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
