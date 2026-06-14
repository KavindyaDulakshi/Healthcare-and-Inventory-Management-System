import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer select-none",
          // Variants
          {
            "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-xs hover:shadow-lg hover:shadow-blue-500/20 border border-blue-500/10":
              variant === "primary",
            "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white shadow-xs hover:shadow-lg hover:shadow-emerald-500/20 border border-emerald-500/10":
              variant === "secondary",
            "border border-border bg-card/65 backdrop-blur-md text-foreground hover:bg-muted hover:border-muted-foreground/30 hover:shadow-sm":
              variant === "outline",
            "hover:bg-muted text-foreground": variant === "ghost",
            "bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-500 dark:to-pink-500 text-white shadow-xs hover:shadow-lg hover:shadow-red-500/20 border border-red-500/10":
              variant === "danger",
            "text-primary underline-offset-4 hover:underline hover:text-blue-500":
              variant === "link",
            "glass-panel text-foreground shadow-xs hover:shadow-md hover:bg-white/30 dark:hover:bg-slate-800/40 border border-white/20 dark:border-white/5":
              variant === "glass",
          },
          // Sizes
          {
            "h-8.5 px-3.5 text-xs rounded-lg": size === "sm",
            "h-10 px-4.5 text-xs rounded-xl": size === "md",
            "h-12 px-6.5 text-sm rounded-2xl": size === "lg",
            "h-10 w-10 rounded-xl": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
