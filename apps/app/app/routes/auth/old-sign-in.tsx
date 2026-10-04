import { redirect } from "react-router"

import type { Route } from "./+types/old-sign-in"

// the two role sign-in pages became one; old links and bookmarks land there
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  return redirect(`/sign-in${new URL(request.url).search}`)
}

export default function OldSignIn() {
  return null
}
