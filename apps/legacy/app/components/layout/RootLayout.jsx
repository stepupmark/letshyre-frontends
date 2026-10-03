import { useDelayedPending } from "@/hooks/useDelayedPending";

/**
 * Top-edge progress bar shown while a navigation is in flight. Wraps the whole
 * app from root.jsx so authenticated routes (which block on clientLoader auth +
 * prefetches) get pending feedback too, not just public routes.
 *
 * Visibility is gated by useDelayedPending so fast/cached navigations don't flash
 * it. Renders no <main> — the nested layouts each provide their own.
 */
export function RootLayout({ children }) {
  const showProgress = useDelayedPending();

  return (
    <>
      {showProgress && (
        <div className="global-progress" role="status" aria-live="polite">
          <span className="global-progress__bar">
            <span className="global-progress__glow" />
          </span>
          <span className="global-progress__label">Loading…</span>
        </div>
      )}
      {children}
    </>
  );
}
