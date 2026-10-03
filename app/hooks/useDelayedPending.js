import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";

// Gates the global progress bar so it never flashes: SHOW_DELAY keeps it hidden
// until a navigation outlasts the delay (fast cached-chunk navs show nothing),
// and MIN_VISIBLE holds it once shown so a just-resolved nav can't flash it off.
// Scoped to "loading" (data/chunk fetches), not "submitting" — mutations own
// their own pending UI.
const SHOW_DELAY_MS = 150;
const MIN_VISIBLE_MS = 400;

export function useDelayedPending() {
  const navigation = useNavigation();
  const isPending = navigation.state === "loading";

  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    // Reveal only after the nav outlasts SHOW_DELAY; if it settles first, the
    // cleanup cancels this and nothing paints.
    if (isPending && !visible) {
      const timer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }

    // Settled while shown: hide only after MIN_VISIBLE. A nav arriving during
    // the hold re-enters the pending branch and the bar just stays up.
    if (!isPending && visible) {
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      const timer = setTimeout(() => setVisible(false), remaining);
      return () => clearTimeout(timer);
    }

    // Steady states (idle+hidden, pending+visible): nothing to schedule.
    return undefined;
  }, [isPending, visible]);

  return visible;
}
