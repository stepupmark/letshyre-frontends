import { redirect } from "react-router";
import { ApiError } from "~/lib/api/api-error";
import { tokenStore } from "~/lib/auth/token-store";
import { queryClient } from "~/lib/query/query-client";
import { authQueries } from "./queries/auth.queries";
import type { AdminProfile } from "./types";

async function getAdmin(): Promise<AdminProfile | null> {
  if (!tokenStore.getAccessToken()) return null;
  try {
    return await queryClient.ensureQueryData(authQueries.me());
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    // a valid token that isn't an admin's
    if (error instanceof ApiError && error.status === 403) {
      tokenStore.clear();
      queryClient.clear();
      throw redirect("/login?reason=forbidden");
    }
    throw error;
  }
}

export async function requireSession({ request }: { request: Request }) {
  if (!(await getAdmin())) {
    const { pathname, search } = new URL(request.url);
    throw redirect(
      `/login?redirectTo=${encodeURIComponent(pathname + search)}`,
    );
  }
}

export function requireGuest() {
  if (tokenStore.getAccessToken()) throw redirect("/dashboard");
}
