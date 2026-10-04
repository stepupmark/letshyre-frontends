import { redirectDocument } from "react-router";

// Routes the new app serves (apps/app/app/lib/live-routes.ts), published with each app
// release. nginx already sends direct visits there; this catches legacy's own client-side
// links, which would otherwise keep rendering the old copy of a migrated page.
let routes;
const load = () =>
  (routes ??= fetch("/live-routes.json", { cache: "no-cache" })
    .then((res) => (res.ok ? res.json() : []))
    .then((list) => list.map((pattern) => new RegExp(pattern)))
    .catch(() => []));

let firstLoad = true;

export async function handOffLiveRoutes({ request }, next) {
  // nginx decided the first page; don't make legacy's startup wait for the list
  if (firstLoad) {
    firstLoad = false;
    void load();
    return next();
  }
  const url = new URL(request.url);
  const live = await load();
  if (live.some((pattern) => pattern.test(url.pathname))) {
    throw redirectDocument(url.pathname + url.search);
  }
  return next();
}
