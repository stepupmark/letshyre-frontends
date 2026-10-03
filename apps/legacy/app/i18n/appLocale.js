import { createContext, useContext } from "react";

// Runtime locale for the client-rendered app shell (auth, dashboards) — the
// pages outside the prerendered /:lang tree, which read the visitor's stored
// preference and can change it in place. Provided by AppLocaleProvider.
export const AppLocaleContext = createContext(null);

export function useAppLocale() {
  const ctx = useContext(AppLocaleContext);
  if (!ctx) throw new Error("useAppLocale must be used within AppLocaleProvider");
  return ctx;
}
