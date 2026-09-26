import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function DashboardGrid({ children, className = "" }: Props) {
  return (
    <div className={`grid grid-cols-1 gap-6 xl:grid-cols-2 ${className}`}>
      {children}
    </div>
  );
}
