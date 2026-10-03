import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

// light only for now; a theme toggle just drops forcedTheme
const FORCED_THEME = "light"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme={FORCED_THEME}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
