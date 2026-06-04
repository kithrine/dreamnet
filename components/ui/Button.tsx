import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-pixel text-xs px-4 py-3 transition-all active:translate-y-px",
        variant === "primary"
          ? "bg-dream-violet text-white pixel-border hover:bg-dream-bright"
          : "bg-dream-surface text-dream-text pixel-border hover:bg-dream-purple",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
