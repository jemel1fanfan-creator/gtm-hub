"use client";

import { Avatar } from "@/components/shared/avatar";
import { teamColors } from "@/lib/utils";
import { Users, FolderKanban, CheckSquare } from "lucide-react";

interface TeamData {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string | null;
  members: { id: string; name: string; image: string | null; role: string }[];
  taskCount: number;
  projectCount: number;
}

export function TeamsContent({ teams }: { teams: TeamData[] }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: team.color + "20" }}>
                <Users size={20} style={{ color: team.color }} />
              </div>
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${teamColors[team.type] || "bg-gray-100 text-gray-600"}`}>
                  {team.type.replace("_", " ")}
                </span>
              </div>
            </div>

            {team.description && <p className="text-sm text-gray-600 mb-3">{team.description}</p>}

            <div className="flex gap-4 mb-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FolderKanban size={14} /> {team.projectCount} projects</span>
              <span className="flex items-center gap-1"><CheckSquare size={14} /> {team.taskCount} tasks</span>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Members ({team.members.length})</p>
              <div className="flex flex-wrap gap-2">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-1.5">
                    <Avatar name={member.name} image={member.image} size="sm" />
                    <span className="text-xs text-gray-700">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
