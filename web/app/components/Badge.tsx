import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
};

const variantStyles = {
  success: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  danger: "bg-red-500/20 text-red-400",
  neutral: "bg-zinc-700/50 text-zinc-400",
  info: "bg-blue-500/20 text-blue-400",
};

export default function Badge({
  children,
  className = "",
  variant = "neutral",
}: BadgeProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border border-transparent ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
