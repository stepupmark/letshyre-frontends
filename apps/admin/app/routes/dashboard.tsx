import type { Route } from "./+types/dashboard";
import { AppShell } from "~/components/layout/app-shell";
import { requireSession } from "~/features/auth";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  requireSession,
];

export const handle = { breadcrumb: "Dashboard" };

export default AppShell;
