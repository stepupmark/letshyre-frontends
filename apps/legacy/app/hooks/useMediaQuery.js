import { useCallback, useSyncExternalStore } from "react";

// Subscribes to a CSS media query. useSyncExternalStore keeps it in sync without
// setState-in-effect and is SSR-safe (server snapshot is false).
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useMediaQuery;
