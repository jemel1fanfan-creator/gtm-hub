import { cn, teamColors } from "@/lib/utils";

export function TeamBadge({ type, name }: { type: string; name: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", teamColors[type] || "bg-gray-100 text-gray-700 border-gray-200")}>
      {name}
    </span>
  );
}
