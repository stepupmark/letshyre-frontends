import { cn } from "@workspace/ui/lib/utils"

import logo from "./assets/logo.webp"

/** The wordmark. Size it with a height class; width follows. */
export function Logo({
  className,
  label = "LetsHyre",
}: {
  className?: string
  label?: string
}) {
  return (
    <img
      src={logo}
      alt={label}
      width={400}
      height={95}
      decoding="async"
      className={cn("h-6 w-auto", className)}
    />
  )
}
