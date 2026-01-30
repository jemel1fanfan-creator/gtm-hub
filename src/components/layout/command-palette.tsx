"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderKanban, CheckSquare, LayoutDashboard, Users, Settings } from "lucide-react";

interface SearchResult {
  type: "project" | "task";
  id: string;
  title: string;
  projectId?: string;
}

const quickActions = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "My Tasks", href: "/my-tasks", icon: CheckSquare },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } catch { /* empty */ }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  function navigate(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-gray-200">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks..."
            className="w-full py-3 outline-none text-sm"
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />
        </div>
        <div className="max-h-72 overflow-auto p-2">
          {query.trim() === "" ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 px-2 py-1">Quick Actions</p>
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => navigate(action.href)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <action.icon size={16} className="text-gray-400" />
                  {action.name}
                </button>
              ))}
            </div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() =>
                  navigate(
                    r.type === "project"
                      ? `/projects/${r.id}`
                      : `/projects/${r.projectId}?task=${r.id}`
                  )
                }
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {r.type === "project" ? (
                  <FolderKanban size={16} className="text-gray-400" />
                ) : (
                  <CheckSquare size={16} className="text-gray-400" />
                )}
                {r.title}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}
