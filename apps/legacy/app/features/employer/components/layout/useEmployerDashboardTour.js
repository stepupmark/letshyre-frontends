import { useState, useEffect, useCallback, useRef } from "react";

// Copied from react-joyride's STATUS/EVENTS/ACTIONS/LIFECYCLE enums rather than
// imported: this hook loads with the dashboard shell, and importing anything
// from the package would pull all ~40 KB of it onto every employer page.
const STATUS = { FINISHED: "finished", SKIPPED: "skipped" };
const EVENTS = { TARGET_NOT_FOUND: "error:target_not_found" };
const ACTIONS = { CLOSE: "close" };
const LIFECYCLE = { TOOLTIP: "tooltip" };

// THE TOUR IS THE RISK IN THIS FILE. react-joyride finds its targets by DOM id
// (#tour-dashboard … #tour-credits, #tour-add-member, #tour-profile) and
// measures them with getBoundingClientRect, so keep those ids and keep the
// credits/members buttons as real <button>s. The tour's auto-start guard and
// the card's hide share one lg query (TOUR_MIN_QUERY) so they can't disagree.

// Tour step targets are DOM ids Joyride measures; content comes from the
// dashboard catalog (tour.steps.<key>) so the tour localizes with the app.
export const makeTourSteps = (t) =>
  [
    ["#tour-dashboard", "dashboard"],
    ["#tour-postjob", "postJob"],
    ["#tour-jobs", "viewJobs"],
    ["#tour-candidates", "candidates"],
    ["#tour-team", "team"],
    ["#tour-billing", "billing"],
    ["#tour-credits", "credits"],
    ["#tour-add-member", "addMember"],
    ["#tour-profile", "profile"],
  ].map(([target, key]) => ({
    target,
    title: t(`tour.steps.${key}.title`),
    content: t(`tour.steps.${key}.content`),
    skipBeacon: true,
  }));

const ls = {
  get: (key) => localStorage.getItem(key),
  set: (key, val) => localStorage.setItem(key, val),
};

/* Tour is desktop-only: the card carries `max-lg:hidden`, so the tour must not
   auto-start below `lg` or the overlay appears with nothing in it.

   Keyed to the breakpoint itself, not to a pixel constant standing in for it.
   Two successive constants (900, then 992) had each drifted from the CSS and
   left a band of widths where the tour ran with its card invisible.

   `max-lg:hidden` compiles to `@media (width < 64em)`, so negating
   `(min-width: 64em)` is its exact complement at every width — the two cannot
   disagree, rather than merely happening to agree today. Stated as `min-width`
   rather than the literal `(width < 64em)` because an unsupported range query
   in matchMedia silently reports `false`, which would run the tour everywhere
   including mobile; `min-width` has no such failure mode. */
const TOUR_MIN_QUERY = "(min-width: 64em)";

// Bump the suffix whenever TOUR_STEPS changes to re-show the tour once.
const TOUR_STORAGE_KEY = "letsHyreTour:v2";

// Matches Joyride's spotlightPadding so our glow ring lines up with its cutout.
const TOUR_SPOTLIGHT_PAD = 10;

// Owns all product-tour state: auto-start gating, persistence, target filtering
// and the Joyride callback. `ready` is true once the step-target data has loaded.
export function useTour({ ready, allSteps }) {
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState(allSteps);
  // Rect of the current step's target, for our own fixed glow ring: Joyride v3's
  // spotlight is a full-viewport svg mask (can't box-shadow it), and a ring on
  // the element would be clipped by the sidebar/main overflow.
  const [highlight, setHighlight] = useState(null);
  const activeTargetRef = useRef(null);

  const moveHighlightTo = useCallback((selector) => {
    activeTargetRef.current = selector;
    const el = selector ? document.querySelector(selector) : null;
    if (!el) {
      setHighlight(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setHighlight({
      top: r.top - TOUR_SPOTLIGHT_PAD,
      left: r.left - TOUR_SPOTLIGHT_PAD,
      width: r.width + TOUR_SPOTLIGHT_PAD * 2,
      height: r.height + TOUR_SPOTLIGHT_PAD * 2,
    });
  }, []);

  const endTour = useCallback(() => {
    activeTargetRef.current = null;
    setHighlight(null);
    setRunTour(false);
    ls.set(TOUR_STORAGE_KEY, "true");
  }, []);

  // Only steps whose target is in the DOM, so a missing one can't leave the
  // overlay stuck on a blank spotlight.
  const startTour = useCallback(() => {
    const available = allSteps.filter((s) => document.querySelector(s.target));
    if (available.length === 0) return;
    setSteps(available);
    setRunTour(true);
  }, [allSteps]);

  // Auto-start once (desktop, unseen, data settled). Persist "seen" the moment
  // it opens so a mid-tour refresh doesn't replay it; the ? button still replays.
  useEffect(() => {
    const isMobile = !window.matchMedia(TOUR_MIN_QUERY).matches;
    const seen = ls.get(TOUR_STORAGE_KEY) === "true";

    if (isMobile || seen || !ready) return;

    const timer = setTimeout(() => {
      ls.set(TOUR_STORAGE_KEY, "true");
      startTour();
    }, 300);
    return () => clearTimeout(timer);
  }, [ready, startTour]);

  // Keep the ring aligned with its target if the viewport reflows mid-step.
  useEffect(() => {
    if (!runTour) return;
    const onReflow = () => moveHighlightTo(activeTargetRef.current);
    window.addEventListener("resize", onReflow);
    return () => window.removeEventListener("resize", onReflow);
  }, [runTour, moveHighlightTo]);

  const handleCallback = useCallback(
    ({ status, action, type, lifecycle, step }) => {
      if (lifecycle === LIFECYCLE.TOOLTIP && step?.target) {
        moveHighlightTo(step.target);
      }

      const finished = status === STATUS.FINISHED || status === STATUS.SKIPPED;
      const closed = action === ACTIONS.CLOSE;
      const targetMissing = type === EVENTS.TARGET_NOT_FOUND;

      if (finished || closed || targetMissing) endTour();
    },
    [moveHighlightTo, endTour],
  );

  return { runTour, steps, highlight, startTour, handleCallback };
}
