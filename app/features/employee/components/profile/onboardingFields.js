import { cn } from "@/lib/utils";

/**
 * Shared field/button classes for the 7-file onboarding wizard.
 *
 * These are the only constants extracted from `employee-onboarding.css` — the
 * rest went inline at their usage sites. They earn a module because all five
 * Step components render the same form vocabulary, and drifting one copy would
 * be invisible until someone compared two steps side by side.
 */

export const FORM_GRID = "grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4";

export const FORM_GROUP = "mb-5 flex flex-col";

/** 13px snaps to `text-sm`. */
export const FIELD_LABEL = "mb-2 text-sm font-semibold text-text-main";

export const FIELD =
  "w-full rounded-md border border-border bg-bg-subtle px-3.5 py-2.5 text-sm text-text-main transition-all duration-200 focus:border-brand-600 focus:bg-card focus:shadow-[0_0_0_3px_rgba(62,126,244,0.15)] focus:outline-none";

export const TEXTAREA = cn(FIELD, "min-h-25 resize-y");

export const FIELD_ERROR = "mt-1.5 text-xs font-medium text-danger";

export const ERROR_MSG =
  "mb-5 rounded-md border border-danger-bg bg-danger-bg px-3.5 py-2.5 text-center text-sm font-medium text-danger";

export const ACTIONS =
  "mt-8 flex items-center justify-end gap-4 border-t border-border pt-6";

/**
 * `.btn-primary`/`.btn-secondary` ride on the Button primitive for its focus
 * ring (the legacy classes had none). `disabled:opacity-100` cancels the
 * primitive's dimming so the flat neutral-300 disabled fill survives.
 */
export const BTN_PRIMARY =
  "h-auto rounded-md px-6 py-2.5 text-sm font-semibold shadow-[0_4px_12px_rgba(62,126,244,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-[0_6px_16px_rgba(62,126,244,0.4)] disabled:bg-neutral-300 disabled:opacity-100 disabled:shadow-none motion-reduce:hover:translate-y-0";

export const BTN_SECONDARY =
  "h-auto rounded-md border border-border bg-neutral-100 px-6 py-2.5 text-sm font-semibold text-text-main transition-all duration-200 hover:bg-border";

/**
 * `.pc-tooltip-*` — a CSS-only hover tooltip on a `group` wrapper. Kept as a
 * hover pattern rather than the Radix Tooltip because it is decorative help
 * text on a `cursor-help` icon, not an interactive control.
 */
export const TOOLTIP_WRAP =
  "group relative ml-1.5 inline-flex cursor-help items-center";

export const TOOLTIP_ICON =
  "text-sm text-neutral-400 transition-colors duration-200 group-hover:text-brand-600";

export const TOOLTIP_TEXT =
  "invisible absolute bottom-[125%] left-1/2 z-100 w-max max-w-62.5 -translate-x-1/2 rounded-sm bg-text-body px-3 py-2 text-center text-sm font-normal text-white opacity-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-opacity duration-300 group-hover:visible group-hover:opacity-100 after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-5 after:border-solid after:border-text-body after:border-r-transparent after:border-b-transparent after:border-l-transparent after:content-['']";
