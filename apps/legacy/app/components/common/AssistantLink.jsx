import { NavLink } from "react-router";
import { BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function AssistantLink({ to, label, className }) {
  return (
    <NavLink
      to={to}
      prefetch="intent"
      title={label}
      className={({ isActive }) =>
        cn(
          "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap no-underline transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 max-lg:h-9.5 max-lg:px-3.5 max-sm:w-9.5 max-sm:justify-center max-sm:px-0",
          isActive
            ? "border-transparent bg-brand-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
            : "border-brand-200 bg-brand-100 text-brand-700 hover:border-brand-300 hover:bg-brand-200",
          className,
        )
      }
    >
      <BrainCircuit size={18} className="shrink-0" aria-hidden="true" />
      <span className="max-sm:sr-only">{label}</span>
    </NavLink>
  );
}
