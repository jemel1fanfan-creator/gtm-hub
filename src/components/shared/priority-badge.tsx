import { cn, priorityColors } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", priorityColors[priority] || "bg-gray-50 text-gray-600 border-gray-200")}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}
