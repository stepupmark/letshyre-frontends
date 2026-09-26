import {
  createContext,
  redirect,
  type RouterContextProvider,
} from "react-router";
import { ApiError } from "~/lib/api/api-error";
import { tokenStore } from "~/lib/auth/token-store";
import { queryClient } from "~/lib/query/query-client";
import { authQueries } from "./queries/auth.queries";
import type { AdminProfile } from "./types";

export type Session = {
  user: AdminProfile;
};

export const sessionContext = createContext<Session | null>(null);

async function getSession(): Promise<Session | null> {
  if (!tokenStore.getAccessToken()) return null;
  try {
    return { user: await queryClient.ensureQueryData(authQueries.me()) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

type MiddlewareArgs = {
  request: Request;
  context: Readonly<RouterContextProvider>;
};

export async function requireSession({ request, context }: MiddlewareArgs) {
  const session = await getSession();
  if (!session) {
    const { pathname, search } = new URL(request.url);
    throw redirect(
      `/login?redirectTo=${encodeURIComponent(pathname + search)}`,
    );
  }
  context.set(sessionContext, session);
}

export function requireGuest() {
  if (tokenStore.getAccessToken()) throw redirect("/dashboard");
}
