import { useEffect, useState } from "react";
import { priceErrorKind } from "@/features/pricing/lib/errorKind";

const SLOW_AFTER_MS = 8000;

// loading | slow | offline | error | ready. A failed background refresh keeps
// the last data on screen rather than taking it away.
export function usePriceStatus({ data, error, isPending, fetchStatus }) {
  const [slow, setSlow] = useState(false);
  const waiting = isPending && fetchStatus === "fetching";

  useEffect(() => {
    if (!waiting) return undefined;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [waiting]);

  if (data !== undefined) return "ready";
  if (isPending && fetchStatus === "paused") return "offline";
  if (isPending) return slow ? "slow" : "loading";

  return priceErrorKind(error) === "offline" ? "offline" : "error";
}
