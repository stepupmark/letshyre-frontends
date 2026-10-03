import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { loadCatalogs, routeNamespaces } from "@/i18n/loadCatalogs";
import { isLocale } from "@/i18n/config";
import { preferredLocale } from "@/i18n/hooks";

const seg = location.pathname.split("/")[1];
const lang = isLocale(seg) ? seg : preferredLocale();

// Client loaders don't run during hydration, so a prerendered page's copy has
// to be loaded here, from the route modules React Router has already matched.
const namespaces = routeNamespaces(Object.values(window.__reactRouterRouteModules ?? {}));

loadCatalogs(lang, namespaces).then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    );
  });
});
