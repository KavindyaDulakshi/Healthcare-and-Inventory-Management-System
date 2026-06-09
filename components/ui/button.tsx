import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-98 cursor-pointer",
          // Variants
          {
            "bg-primary text-white hover:bg-blue-600 shadow-sm hover:shadow-md hover:shadow-blue-500/10":
              variant === "primary",
            "bg-secondary text-white hover:bg-emerald-600 shadow-sm hover:shadow-md hover:shadow-emerald-500/10":
              variant === "secondary",
            "border border-border bg-card text-foreground hover:bg-muted":
              variant === "outline",
            "hover:bg-muted text-foreground": variant === "ghost",
            "bg-danger text-white hover:bg-red-600 shadow-sm hover:shadow-md hover:shadow-red-500/10":
              variant === "danger",
            "text-primary underline-offset-4 hover:underline hover:text-blue-600":
              variant === "link",
          },
          // Sizes
          {
            "h-9 px-3 text-xs rounded-md": size === "sm",
            "h-10 px-4 text-sm rounded-lg": size === "md",
            "h-12 px-6 text-base rounded-xl": size === "lg",
            "h-10 w-10 rounded-lg": size === "icon",
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
