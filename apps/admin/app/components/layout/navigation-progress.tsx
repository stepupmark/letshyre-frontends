import { useState } from "react";
import { useNavigation } from "react-router";
import { cn } from "cn";

export function NavigationProgress() {
  const busy = useNavigation().state !== "idle";
  const [run, setRun] = useState(0);
  const [wasBusy, setWasBusy] = useState(busy);
  if (busy !== wasBusy) {
    setWasBusy(busy);
    if (busy) setRun((count) => count + 1);
  }

  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      aria-hidden={!busy}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <div
        key={run}
        className={cn(
          "h-full bg-primary",
          busy
            ? "animate-nav-progress motion-reduce:w-2/3 motion-reduce:animate-none"
            : "w-full opacity-0 transition-opacity delay-150 duration-300",
          run === 0 && "hidden",
        )}
      />
    </div>
  );
}
