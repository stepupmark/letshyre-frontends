/**
 * PrivateRoute.ts
 *
 * Loader function used by every private route.
 * In React Router v7 data-router style, guards live in loaders — no wrapper
 * components needed.
 */

import { redirect } from "react-router";
import { TOKEN_KEY } from "../context/AuthContext.tsx";

/** Attach to any route that requires authentication. */
export function privateLoader() {
  return localStorage.getItem(TOKEN_KEY) ? null : redirect("/");
}
