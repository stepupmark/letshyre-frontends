import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

const LIGHT = "light"
const DARK = "dark"

/** Follows the system until the visitor picks a side. */
export function SiteThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation("common")
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label={t("theme.toggle")}
      className={className}
      onClick={() => {
        setTheme(resolvedTheme === DARK ? LIGHT : DARK)
      }}
    >
      <SunIcon aria-hidden className="dark:hidden" />
      <MoonIcon aria-hidden className="hidden dark:block" />
    </Button>
  )
}
