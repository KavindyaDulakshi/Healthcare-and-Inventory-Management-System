"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}: DialogProps) {
  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Overlay background with blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 dark:bg-black/65 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={cn(
              "glass-panel relative w-full max-w-lg rounded-2xl bg-card/90 dark:bg-card/85 text-foreground p-6 shadow-2xl z-10 flex flex-col gap-4 overflow-y-auto max-h-[90vh] pt-7",
              className
            )}
          >
            {/* Horizontal gradient stripe at the top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-t-2xl" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 pr-8 text-left">
                {title && (
                  <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
                )}
                {description && (
                  <p className="text-xs text-muted-foreground leading-normal">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 hover:rotate-90 border border-transparent hover:border-border/60 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Helper hook
import { useEffect } from "react";
