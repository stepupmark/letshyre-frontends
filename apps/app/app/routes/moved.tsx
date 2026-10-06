import { redirect } from "react-router"

import { movedTo } from "@/lib/moved"

import type { Route } from "./+types/moved"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  return redirect(movedTo(new URL(request.url)))
}

export default function Moved() {
  return null
}
