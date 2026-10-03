import { cn } from "@/lib/utils"

/**
 * Diverges from upstream shadcn, which uses `animate-pulse bg-accent`.
 *
 * Every loading state in this app shimmers — a gradient sweeping left to right
 * — rather than pulsing opacity. Three separate implementations of that
 * shimmer existed before this component absorbed them. Keeping upstream's
 * pulse would have made the primitive the odd one out and blocked adoption, so
 * the app's own idiom wins. `.skeleton-shimmer` is defined in
 * app/styles/tailwind.css under @layer components.
 *
 * Pass `pulse` to opt back into upstream's behaviour.
 */
function Skeleton({
  className,
  pulse = false,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        pulse ? "animate-pulse bg-accent" : "skeleton-shimmer",
        className
      )}
      {...props} />
  );
}

export { Skeleton }
