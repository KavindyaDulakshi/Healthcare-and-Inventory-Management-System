import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "warning" | "danger" | "accent" | "outline";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary/10 text-primary": variant === "primary",
          "border-transparent bg-secondary/10 text-secondary": variant === "secondary",
          "border-transparent bg-warning/10 text-warning": variant === "warning",
          "border-transparent bg-danger/10 text-danger": variant === "danger",
          "border-transparent bg-accent/10 text-accent": variant === "accent",
          "border-border bg-card text-foreground": variant === "outline"
        },
        className
      )}
      {...props}
    />
  );
}
