"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary"
          ? "dream-btn text-white"
          : "rounded-full bg-white/10 border border-white/20 text-dream-text hover:bg-white/15 active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
