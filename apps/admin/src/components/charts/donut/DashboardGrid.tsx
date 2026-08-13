/**
 * DashboardGrid.tsx
 *
 * Reusable layout component for the analytics section.
 * Provides a responsive 2-col → 1-col grid with consistent spacing.
 */

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function DashboardGrid({ children, className = "" }: Props) {
  return (
    <div
      className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${className}`}
    >
      {children}
    </div>
  );
}
