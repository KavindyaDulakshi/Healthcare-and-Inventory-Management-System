"use client";

import React, { useState, useEffect, useRef } from "react";

interface SafeResponsiveContainerProps {
  children: (width: number, height: number) => React.ReactNode;
  height?: number | string;
}

export function SafeResponsiveContainer({ children, height = "100%" }: SafeResponsiveContainerProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });

    resizeObserver.observe(element);

    // Initial measurement
    const rect = element.getBoundingClientRect();
    setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="w-full h-full min-h-0 min-w-0" style={{ height }}>
      {size.width > 0 && size.height > 0 ? (
        children(size.width, size.height)
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          Loading chart...
        </div>
      )}
    </div>
  );
}
