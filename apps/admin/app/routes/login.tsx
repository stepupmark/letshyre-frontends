import { SIGN_IN } from "@workspace/auth"
import { redirect } from "react-router"

import type { Route } from "./+types/login"

// old address, kept for bookmarks
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const params = new URL(request.url).searchParams
  const next = params.get("redirectTo")
  if (next) {
    params.delete("redirectTo")
    params.set("next", next)
  }
  const query = params.toString()
  return redirect(query ? `${SIGN_IN}?${query}` : SIGN_IN)
}

export default function Login() {
  return null
}
