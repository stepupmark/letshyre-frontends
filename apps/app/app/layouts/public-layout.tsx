import { Outlet } from "react-router"

import { BareHeader } from "@/components/bare-header"
import { namespaces } from "@/lib/i18n"

export const clientMiddleware = [namespaces(["shell"])]

export default function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <BareHeader homeHref="/" />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-(--gutter) py-8 outline-none [--gutter:--spacing(4)] sm:py-12 sm:[--gutter:--spacing(6)]"
      >
        <Outlet />
      </main>
    </div>
  )
}
