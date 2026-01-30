import { getInitials, cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export function Avatar({ name, image, size = "md", className }: AvatarProps) {
  if (image) {
    return <img src={image} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />;
  }
  return (
    <div className={cn("rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium", sizes[size], className)}>
      {getInitials(name)}
    </div>
  );
}
