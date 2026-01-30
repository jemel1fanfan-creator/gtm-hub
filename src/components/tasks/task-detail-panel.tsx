"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Flag, Users, MessageSquare, CheckSquare, Plus, Trash2 } from "lucide-react";
import { cn, statusLabels, priorityDotColors, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/shared/avatar";

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string; image: string | null } | null;
  creator: { id: string; name: string; image: string | null };
  team: { id: string; name: string; type: string } | null;
  labels: { id: string; name: string; color: string }[];
  subtasks: { id: string; title: string; status: string; assignee: { id: string; name: string; image: string | null } | null }[];
  comments: { id: string; content: string; createdAt: string; user: { id: string; name: string; image: string | null } }[];
}

interface TaskDetailPanelProps {
  taskId: string;
  projectId: string;
  users: { id: string; name: string; image: string | null }[];
  teams: { id: string; name: string; type: string }[];
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskDetailPanel({ taskId, projectId, users, teams, onClose, onUpdate }: TaskDetailPanelProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((data) => {
        setTask(data);
        setTitle(data.title);
        setDescription(data.description || "");
      });
  }, [taskId]);

  async function updateField(field: string, value: unknown) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const res = await fetch(`/api/tasks/${taskId}`);
    const updated = await res.json();
    setTask(updated);
    onUpdate();
  }

  async function saveTitle() {
    setEditingTitle(false);
    if (title.trim() && title !== task?.title) {
      await updateField("title", title.trim());
    }
  }

  async function saveDescription() {
    setEditingDesc(false);
    if (description !== (task?.description || "")) {
      await updateField("description", description);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, content: newComment.trim() }),
    });
    setNewComment("");
    const res = await fetch(`/api/tasks/${taskId}`);
    setTask(await res.json());
    onUpdate();
  }

  async function addSubtask() {
    if (!newSubtask.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSubtask.trim(), projectId, parentId: taskId }),
    });
    setNewSubtask("");
    setShowSubtaskInput(false);
    const res = await fetch(`/api/tasks/${taskId}`);
    setTask(await res.json());
    onUpdate();
  }

  async function toggleSubtask(subtaskId: string, currentStatus: string) {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    await fetch(`/api/tasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const res = await fetch(`/api/tasks/${taskId}`);
    setTask(await res.json());
    onUpdate();
  }

  async function deleteTask() {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    onClose();
    onUpdate();
  }

  if (!task) {
    return (
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl border-l border-gray-200 z-40 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const doneSubtasks = task.subtasks.filter((s) => s.status === "DONE").length;
  const subtaskProgress = task.subtasks.length > 0 ? Math.round((doneSubtasks / task.subtasks.length) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="text-xs font-medium bg-gray-100 rounded-lg px-2 py-1 border-0"
            >
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={deleteTask} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Title */}
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                className="text-lg font-semibold w-full outline-none border-b-2 border-indigo-500 pb-1"
              />
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                className="text-lg font-semibold cursor-pointer hover:text-indigo-600 transition"
              >
                {task.title}
              </h2>
            )}

            {/* Fields */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Flag size={16} className="text-gray-400" />
                <select
                  value={task.priority}
                  onChange={(e) => updateField("priority", e.target.value)}
                  className="text-sm bg-transparent border-0 cursor-pointer hover:text-indigo-600"
                >
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <div className={cn("w-2.5 h-2.5 rounded-full", priorityDotColors[task.priority])} />
              </div>

              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-400" />
                <select
                  value={task.assignee?.id || ""}
                  onChange={(e) => updateField("assigneeId", e.target.value || null)}
                  className="text-sm bg-transparent border-0 cursor-pointer hover:text-indigo-600"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Users size={16} className="text-gray-400" />
                <select
                  value={task.team?.id || ""}
                  onChange={(e) => updateField("teamId", e.target.value || null)}
                  className="text-sm bg-transparent border-0 cursor-pointer hover:text-indigo-600"
                >
                  <option value="">No Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <input
                  type="date"
                  value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => updateField("dueDate", e.target.value || null)}
                  className="text-sm bg-transparent border-0 cursor-pointer hover:text-indigo-600"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              {editingDesc ? (
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={saveDescription}
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Add a description..."
                />
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 rounded-lg p-3 min-h-[60px] border border-transparent hover:border-gray-200"
                >
                  {task.description || <span className="text-gray-400">Click to add description...</span>}
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckSquare size={14} />
                  Subtasks
                  {task.subtasks.length > 0 && (
                    <span className="text-xs text-gray-400">({doneSubtasks}/{task.subtasks.length})</span>
                  )}
                </h3>
                <button
                  onClick={() => setShowSubtaskInput(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              {task.subtasks.length > 0 && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${subtaskProgress}%` }} />
                </div>
              )}

              <div className="space-y-1.5">
                {task.subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 py-1">
                    <button
                      onClick={() => toggleSubtask(sub.id, sub.status)}
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                        sub.status === "DONE"
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {sub.status === "DONE" && <span className="text-[10px]">✓</span>}
                    </button>
                    <span className={cn("text-sm", sub.status === "DONE" && "line-through text-gray-400")}>
                      {sub.title}
                    </span>
                  </div>
                ))}
                {showSubtaskInput && (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addSubtask();
                        if (e.key === "Escape") setShowSubtaskInput(false);
                      }}
                      placeholder="Subtask title..."
                      className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={addSubtask} className="text-xs text-indigo-600 font-medium">Add</button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <MessageSquare size={14} />
                Comments ({task.comments.length})
              </h3>

              <div className="space-y-3 mb-3">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <Avatar name={comment.user.name} image={comment.user.image} size="sm" className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{comment.user.name}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 self-end"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
