import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

import tour from "@/assets/Tour.webp";

const JOYRIDE_STYLES = {
  options: {
    zIndex: 99999,
    overlayColor: "rgba(10, 25, 60, 0.75)",
    primaryColor: "#4f8cff",
  },
  spotlight: { backgroundColor: "transparent" },
  tooltip: {
    borderRadius: "16px",
    padding: "0px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    background: "transparent",
  },
  tooltipContent: { padding: "0px" },
  buttonNext: {
    background: "black",
    color: "white",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
  },
  buttonBack: {
    background: "#cde1ff",
    color: "#333",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
  },
  buttonSkip: { color: "#333", fontSize: "50px", background: "#0d6af6ff" },
};

// Module-level so Joyride doesn't remount it every render. Uses Joyride's `size`
// so the count stays right even when steps are filtered to present targets.
function TourTooltip({
  step,
  index,
  size,
  backProps,
  primaryProps,
  skipProps,
  isLastStep,
}) {
  const { t } = useTranslation("dashboard");
  return (
    // The max-lg:hidden isn't cosmetic — the auto-start guard keys off the same
    // breakpoint; see TOUR_MIN_QUERY.
    <div className="relative flex w-110 max-w-[90vw] overflow-hidden rounded-lg border border-border-soft bg-gradient-to-br from-card from-40% to-brand-100 shadow-[0_25px_60px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none max-lg:hidden">
      <div className="flex-1 p-6">
        <div className="mb-2 text-xs font-semibold tracking-[0.5px] uppercase text-brand-500">
          {index + 1}/{size}
        </div>
        <h4 className="mt-0 mb-2 text-lg font-extrabold text-neutral-800">
          {step.title}
        </h4>
        <p className="mb-5 text-sm leading-[1.5] font-bold text-neutral-500">
          {step.content}
        </p>
        <div className="flex gap-3">
          {index > 0 && (
            <button
              {...backProps}
              className="cursor-pointer rounded-md border-none bg-gradient-to-br from-brand-500 to-[#a9c6f9] px-4 py-2 font-semibold text-text-muted transition-all duration-200 hover:bg-border hover:bg-none"
            >
              {t("tour.back")}
            </button>
          )}
          <button
            {...primaryProps}
            className="cursor-pointer rounded-md border-none bg-text-main px-5 py-2 font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(98,150,239,0.3)] motion-reduce:hover:translate-y-0"
          >
            {isLastStep ? t("tour.finish") : t("tour.next")}
          </button>
        </div>
      </div>
      <div className="flex w-40 items-center justify-center bg-transparent">
        <img
          src={tour}
          alt={t("tour.alt")}
          className="-me-5 w-[120%] object-contain"
        />
      </div>
      <button
        {...skipProps}
        className="absolute top-3 end-4 cursor-pointer border-none bg-none p-0 text-sm leading-none font-medium font-[inherit] text-text-main transition-colors duration-200 hover:text-neutral-500"
      >
        {t("tour.skip")}
      </button>
    </div>
  );
}

// The tour runs once per employer, so the library is fetched when it starts
// rather than with the dashboard shell that mounts this overlay.
const Joyride = lazy(() =>
  import("react-joyride").then((m) => ({ default: m.Joyride })),
);

export function TourOverlay({ steps, run, highlight, onCallback }) {
  return (
    <>
      {run && (
        <Suspense fallback={null}>
          <Joyride
            steps={steps}
            run
            continuous
            showSkipButton
            scrollToFirstStep
            callback={onCallback}
            styles={JOYRIDE_STYLES}
            tooltipComponent={TourTooltip}
          />
        </Suspense>
      )}

      {/* Our own glow ring — Joyride v3's spotlight is an svg mask that can't
          carry a box-shadow. z-100000 clears its overlay (zIndex 99999); no
          background, or it would tint the highlighted target. */}
      {run && highlight && (
        <div
          className="pointer-events-none fixed z-[100000] rounded-md shadow-[0_0_0_4px_rgba(79,140,255,0.9),0_0_25px_rgba(79,140,255,0.6),0_0_50px_rgba(79,140,255,0.4)] transition-[top,left,width,height] duration-300 ease-[ease]"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
          }}
        />
      )}
    </>
  );
}
