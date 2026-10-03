import { CheckIcon, LanguagesIcon } from "lucide-react"

import { dirFor, LOCALE_NAMES, type Locale } from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

interface LanguageSwitcherProps {
  current: Locale
  /** Only locales the current page is ready in. */
  locales: readonly Locale[]
  /** Read before the current language by screen readers, e.g. "Language". */
  label: string
  hrefFor: (locale: Locale) => string
  /** Runs before navigating, e.g. to remember the choice in `lh_locale`. */
  onSelect?: (locale: Locale) => void
}

export function LanguageSwitcher({
  current,
  locales,
  label,
  hrefFor,
  onSelect,
}: LanguageSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" />}
        aria-label={`${label}: ${LOCALE_NAMES[current]}`}
      >
        <LanguagesIcon aria-hidden />
        <span lang={current}>{LOCALE_NAMES[current]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            render={({ children, ...props }) => (
              <a
                {...props}
                href={hrefFor(locale)}
                hrefLang={locale}
                lang={locale}
                dir={dirFor(locale)}
                aria-current={locale === current ? "true" : undefined}
              >
                {children}
              </a>
            )}
            onClick={() => onSelect?.(locale)}
          >
            <span className="flex-1">{LOCALE_NAMES[locale]}</span>
            {locale === current && <CheckIcon aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
