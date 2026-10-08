import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

const LIGHT = "light"

/** Light only, unless the app ships a theme toggle (`switchable`). */
export function ThemeProvider({
  children,
  switchable = false,
}: {
  children: ReactNode
  switchable?: boolean
}) {
  return (
    <NextThemesProvider
      attribute="class"
      {...(switchable ? { enableSystem: true } : { forcedTheme: LIGHT })}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
