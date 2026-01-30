"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import { TeamBadge } from "@/components/shared/team-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectForm } from "./project-form";

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: string;
  teams: { id: string; name: string; type: string }[];
  totalTasks: number;
  doneTasks: number;
  updatedAt: string;
}

export function ProjectList({ projects }: { projects: ProjectSummary[] }) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing tasks."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Create Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const pct = project.totalTasks > 0 ? Math.round((project.doneTasks / project.totalTasks) * 100) : 0;
            return (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <FolderKanban size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span className="text-xs text-gray-500 capitalize">{project.status.toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
                )}

                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {project.teams.map((team) => (
                    <TeamBadge key={team.id} type={team.type} name={team.name} />
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{project.doneTasks}/{project.totalTasks} tasks</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <ProjectForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); router.refresh(); }} />}
    </div>
  );
}
