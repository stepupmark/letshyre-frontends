import { cn } from "@/lib/utils";

/**
 * The shared card surface — a soft-bordered, padded, subtly-shadowed rounded
 * panel on the card background.
 *
 * The exact class string below was hand-repeated across the profile / info /
 * stat cards (17 sites at extraction time), so the surface treatment now lives
 * in one place. Extra classes merge through `cn`, letting callers add their own
 * layout (flex, gap, text-center, min-height, …) or override the padding; and
 * every other prop — `key` aside, which React consumes — forwards to the div,
 * so `aria-*`, `onClick`, `style` and the rest keep working.
 */
export function Panel({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-soft bg-card p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
