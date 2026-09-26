import type { ReactNode } from "react";
import { ThemeToggle } from "~/components/theme-toggle";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src="/letshyre.png" alt="" className="size-8 rounded-md" />
          <span className="text-lg font-semibold">LetsHyre Admin</span>
        </div>
        {children}
      </div>
    </div>
  );
}
