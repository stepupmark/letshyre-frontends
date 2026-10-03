import { useEffect } from "react";
import { useLocation } from "react-router";
import { initMetaPixel, isTrackablePath, trackPageView } from "@/lib/metaPixel";

/**
 * Loads the Meta Pixel and sends a PageView on every client-side navigation to
 * a public page. Mounted once from root.jsx. Keyed on pathname alone so a
 * query-string or hash change isn't counted as another view.
 */
export function useMetaPixel() {
  const { pathname } = useLocation();

  useEffect(() => {
    initMetaPixel();
    if (isTrackablePath(pathname)) trackPageView();
  }, [pathname]);
}
