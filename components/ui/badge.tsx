import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "warning" | "danger" | "accent" | "outline";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const showPulseDot = ["warning", "danger", "secondary"].includes(variant);
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105 select-none",
        {
          "border-transparent bg-primary/10 text-primary shadow-xs shadow-primary/5": variant === "primary",
          "border-transparent bg-secondary/10 text-secondary shadow-xs shadow-secondary/5": variant === "secondary",
          "border-transparent bg-warning/10 text-warning shadow-xs shadow-warning/5": variant === "warning",
          "border-transparent bg-danger/10 text-danger shadow-xs shadow-danger/5": variant === "danger",
          "border-transparent bg-accent/10 text-accent shadow-xs shadow-accent/5": variant === "accent",
          "border-border bg-card text-foreground": variant === "outline"
        },
        className
      )}
      {...props}
    >
      {showPulseDot && (
        <span
          className={cn("mr-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0", {
            "animate-pulse-dot": variant === "danger" || variant === "warning"
          })}
        />
      )}
      {props.children}
    </div>
  );
}
