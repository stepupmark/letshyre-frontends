import { cn } from "@workspace/ui/lib/utils"

import logo from "./assets/logo.webp"
import mark from "./assets/mark.png"

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

/** The square "LH" mark, for places too narrow for the wordmark. */
export function LogoMark({
  className,
  label = "LetsHyre",
}: {
  className?: string
  label?: string
}) {
  return (
    <img
      src={mark}
      alt={label}
      width={192}
      height={192}
      decoding="async"
      className={cn("size-8 rounded-md", className)}
    />
  )
}
