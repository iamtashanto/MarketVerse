import type { ReactNode } from "react";

/** Visible to screen readers only — standard "sr-only" clip pattern. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
      {children}
    </span>
  );
}
