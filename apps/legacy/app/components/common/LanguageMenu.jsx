import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Languages, LoaderCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LOCALES, LOCALE_ENGLISH_NAMES, LOCALE_NAMES, dirFor, isLocale } from "@/i18n/config";

function browserLocales() {
  try {
    const codes = navigator.languages.map((l) => l.slice(0, 2).toLowerCase());
    return [...new Set(codes)].filter(isLocale).slice(0, 3);
  } catch {
    return [];
  }
}

function LanguageOption({ code, current, onSelect }) {
  const selected = code === current;
  const hint = LOCALE_ENGLISH_NAMES[code];
  const showHint = hint !== LOCALE_NAMES[code];

  return (
    <DropdownMenuItem
      role="menuitemradio"
      aria-checked={selected}
      aria-label={showHint ? `${LOCALE_NAMES[code]} (${hint})` : undefined}
      onSelect={() => onSelect(code)}
      className={cn(
        "min-h-11 cursor-pointer gap-3 rounded-md px-3 py-1.5",
        selected && "bg-brand-100 focus:bg-brand-100",
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col text-start">
        <span
          className={cn(
            "truncate text-sm font-medium text-text-body",
            selected && "font-semibold text-brand-700",
          )}
        >
          <bdi lang={code}>{LOCALE_NAMES[code]}</bdi>
        </span>
        {showHint && (
          <span lang="en" className="truncate text-xs text-neutral-500">
            {hint}
          </span>
        )}
      </span>
      {selected && <Check size={16} className="text-brand-600" aria-hidden="true" />}
    </DropdownMenuItem>
  );
}

// Column-major on wider screens so arrow keys move down a column, not across rows.
function LanguageGrid({ codes, ...optionProps }) {
  return (
    <div
      style={{ "--rows": Math.ceil(codes.length / 2) }}
      className="grid gap-0.5 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(var(--rows),auto)]"
    >
      {codes.map((code) => (
        <LanguageOption key={code} code={code} {...optionProps} />
      ))}
    </div>
  );
}

// Rendered only while the menu is open, so navigator is never read during prerender.
function LanguageOptions({ current, onSelect }) {
  const { t } = useTranslation();
  const suggested = browserLocales();
  const showSuggested = suggested.some((code) => code !== current);
  const rest = showSuggested ? LOCALES.filter((code) => !suggested.includes(code)) : LOCALES;
  const optionProps = { current, onSelect };

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2 px-3 pt-2 pb-2 text-sm font-semibold text-neutral-800">
        <Languages size={16} className="text-brand-600" aria-hidden="true" />
        {t("nav.languageMenu")}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {showSuggested && (
        <>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500">{t("nav.languageSuggested")}</DropdownMenuLabel>
            <LanguageGrid codes={suggested} {...optionProps} />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuGroup>
        {showSuggested && (
          <DropdownMenuLabel className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500">{t("nav.languageAll")}</DropdownMenuLabel>
        )}
        <LanguageGrid codes={rest} {...optionProps} />
      </DropdownMenuGroup>
    </>
  );
}

export function LanguageMenu({
  current,
  onSelect,
  pending = false,
  variant = "default",
  compact = false,
  align = "end",
  className,
  triggerClassName,
}) {
  const { t } = useTranslation();
  const toolbar = variant === "toolbar";
  // Below xl, or once the links have collapsed, the navbar has room for an icon and the code only.
  const navbar = variant === "navbar";
  const narrow = navbar && compact;
  const Icon = pending ? LoaderCircle : Languages;

  return (
    <DropdownMenu dir={dirFor(current)}>
      <DropdownMenuTrigger
        aria-label={`${LOCALE_NAMES[current]}, ${t("nav.language")}`}
        aria-busy={pending}
        title={t("nav.language")}
        className={cn(
          "group flex shrink-0 cursor-pointer items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
          toolbar
            ? "h-11 gap-2 rounded-full border border-border bg-bg-subtle px-4 text-sm font-semibold text-neutral-700 hover:border-brand-300 hover:bg-brand-100 hover:text-brand-700 data-[state=open]:border-brand-300 data-[state=open]:bg-brand-100 data-[state=open]:text-brand-700 max-lg:h-9.5 max-lg:px-3 max-sm:w-9.5 max-sm:justify-center max-sm:px-0"
            : "rounded-md px-2 py-1.5 text-[0.95rem] font-medium text-text-body hover:text-brand-900",
          navbar &&
            "max-xl:h-11 max-xl:min-w-11 max-xl:justify-center max-xl:rounded-full max-xl:py-0 max-xl:text-sm max-xl:font-semibold max-xl:hover:bg-[rgba(15,23,42,0.04)]",
          narrow &&
            "h-11 min-w-11 justify-center rounded-full py-0 text-sm font-semibold hover:bg-[rgba(15,23,42,0.04)]",
          triggerClassName,
        )}
      >
        <Icon
          size={18}
          className={cn("shrink-0", pending && "animate-spin motion-reduce:animate-none")}
          aria-hidden="true"
        />
        <bdi lang={current} className={cn((toolbar || navbar) && "max-xl:hidden", narrow && "hidden")}>
          {LOCALE_NAMES[current]}
        </bdi>
        {toolbar && (
          <span className="uppercase max-sm:hidden xl:hidden" aria-hidden="true">
            {current}
          </span>
        )}
        {navbar && (
          <span
            className={cn("hidden uppercase max-xl:inline max-sm:hidden", narrow && "inline")}
            aria-hidden="true"
          >
            {current}
          </span>
        )}
        <ChevronDown
          size={16}
          className={cn(
            "text-neutral-400 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none",
            (toolbar || navbar) && "max-xl:hidden",
            narrow && "hidden",
          )}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className={cn("w-[min(30rem,calc(100vw-2rem))] rounded-lg p-1.5 shadow-lg", className)}
      >
        <LanguageOptions current={current} onSelect={onSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
