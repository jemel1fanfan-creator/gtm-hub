import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const priorityColors: Record<string, string> = {
  URGENT: "border-red-500 bg-red-50 text-red-700",
  HIGH: "border-orange-500 bg-orange-50 text-orange-700",
  MEDIUM: "border-blue-500 bg-blue-50 text-blue-700",
  LOW: "border-gray-400 bg-gray-50 text-gray-600",
};

export const priorityDotColors: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-gray-400",
};

export const teamColors: Record<string, string> = {
  MARKETING: "bg-purple-100 text-purple-700 border-purple-200",
  SALES: "bg-green-100 text-green-700 border-green-200",
  CUSTOMER_SUCCESS: "bg-amber-100 text-amber-700 border-amber-200",
  ENGINEERING: "bg-blue-100 text-blue-700 border-blue-200",
  OPERATIONS: "bg-gray-100 text-gray-700 border-gray-200",
};

export const statusLabels: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const statusColumns = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date(new Date().toDateString());
}
