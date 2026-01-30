"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { statusLabels } from "@/lib/utils";

interface TaskFiltersProps {
  users: { id: string; name: string }[];
  teams: { id: string; name: string; type: string }[];
}

export function TaskFilters({ users, teams }: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assignee = searchParams.get("assignee");
  const team = searchParams.get("team");

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeFilters = [
    status && { key: "status", label: statusLabels[status] || status },
    priority && { key: "priority", label: priority },
    assignee && { key: "assignee", label: users.find((u) => u.id === assignee)?.name || "Unknown" },
    team && { key: "team", label: teams.find((t) => t.id === team)?.name || "Unknown" },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={status || ""}
        onChange={(e) => setFilter("status", e.target.value || null)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
      >
        <option value="">All Statuses</option>
        {Object.entries(statusLabels).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select
        value={priority || ""}
        onChange={(e) => setFilter("priority", e.target.value || null)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
      >
        <option value="">All Priorities</option>
        <option value="URGENT">Urgent</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <select
        value={assignee || ""}
        onChange={(e) => setFilter("assignee", e.target.value || null)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
      >
        <option value="">All Assignees</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>

      <select
        value={team || ""}
        onChange={(e) => setFilter("team", e.target.value || null)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
      >
        <option value="">All Teams</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 ml-2">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key, null)}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100"
            >
              {f.label}
              <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
