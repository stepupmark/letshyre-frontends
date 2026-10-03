import { useEffect, useRef } from "react";

// Escape-to-close + focus trap + scroll lock + focus restore, for the few
// overlays not on Radix Dialog (MyApplications' AnimatePresence exit, the
// employer-profile form). Prefer Radix Dialog for anything new — this only
// backfills already-shipped overlays. Pass `active` (the boolean that renders
// the overlay); spread the returned ref onto the focus container.
export function useDialogA11y(active, onClose) {
  const containerRef = useRef(null);
  // Via a ref so an inline-arrow onClose doesn't re-bind the listener each render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return undefined;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement;

    // Re-queried each Tab, not cached — these overlays load async content that
    // would stale a captured list.
    const focusable = () =>
      Array.from(
        container?.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) {
        // Nothing tabbable: hold focus on the container rather than let Tab escape.
        e.preventDefault();
        container?.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      // Focus outside the overlay counts as "before first" so Tab enters, not escapes.
      if (!container?.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    // Scroll lock; pad back the scrollbar width so the page doesn't jump sideways.
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    // Focus on the next frame — the overlay may still be mid-mount/animation,
    // and focusing a zero-opacity node makes some screen readers announce nothing.
    const raf = requestAnimationFrame(() => {
      const items = focusable();
      (items[0] ?? container)?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      // Restore focus only if it's still inside the overlay — yanking it back
      // after the user clicked elsewhere is worse.
      if (
        previouslyFocused instanceof HTMLElement &&
        (!document.activeElement || container?.contains(document.activeElement))
      ) {
        previouslyFocused.focus();
      }
    };
  }, [active]);

  return containerRef;
}

export default useDialogA11y;
