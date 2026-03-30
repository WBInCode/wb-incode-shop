import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "accent";
  className?: string;
}

export default function Badge({ children, variant = "primary", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
        {
          "bg-primary/10 text-primary border border-primary/20": variant === "primary",
          "bg-white/5 text-gray-400 border border-white/10": variant === "outline",
          "bg-accent/20 text-primary border border-accent/30": variant === "accent",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
