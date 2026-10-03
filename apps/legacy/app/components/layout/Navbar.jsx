import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, localePath, localesForPage } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";
import { LanguageSwitcher } from "./LanguageSwitcher";
import logo from "@/assets/logo2.webp";

const NAV_LINK =
  "relative shrink-0 rounded-full px-4 py-2 text-[0.95rem] font-medium whitespace-nowrap text-text-muted no-underline transition-all hover:bg-[rgba(15,23,42,0.04)] hover:text-brand-900";
const NAV_LINK_ACTIVE = "bg-[rgba(15,23,42,0.04)] font-semibold text-brand-900";

const MOBILE_LINK =
  "mb-3 block w-full box-border rounded-none py-3 text-center text-[1.75rem] font-medium tracking-[-0.03em] text-neutral-500 no-underline transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:font-bold hover:text-brand-900 motion-reduce:hover:scale-100";
const MOBILE_LINK_ACTIVE = "scale-105 font-bold text-brand-900";

const BURGER_PATH =
  "origin-center transition-[transform,translate,rotate,opacity,d] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

// `to` is the locale-relative suffix, prefixed with /:lang at render.
const NAV_ITEMS = [
  { to: "#home", labelKey: "nav.home" },
  { to: "#how-it-works", labelKey: "nav.howItWorks" },
  { to: "/how-it-works-interview", labelKey: "nav.aiInterview" },
  { to: "#scorecards", labelKey: "nav.scorecards" },
  { to: "/pricing", labelKey: "nav.pricing" },
  { to: "/contact", labelKey: "nav.contact" },
];

// Translated labels differ too much in length for one breakpoint to suit every
// locale, so the links collapse into the menu whenever they don't fit. The row
// width they need is remembered so the check can't flip back and forth.
function useCompactNav(rowRef, navRef, lang) {
  const [compactFor, setCompactFor] = useState(null);
  const needed = useRef(0);
  const compact = compactFor === lang;

  useLayoutEffect(() => {
    const row = rowRef.current;
    const nav = navRef.current;
    if (!row || !nav) return undefined;

    const check = () => {
      if (compact) {
        if (row.clientWidth >= needed.current) setCompactFor(null);
        return;
      }
      const links = [...nav.children];
      if (!links.length || !nav.clientWidth) return;
      const gap = parseFloat(getComputedStyle(nav).columnGap) || 0;
      const content = links.reduce((sum, link) => sum + link.getBoundingClientRect().width, gap * (links.length - 1));
      const overflow = content - nav.clientWidth;
      if (overflow > 0) {
        needed.current = row.clientWidth + Math.ceil(overflow) + 1;
        setCompactFor(lang);
      }
    };

    let active = true;
    check();
    document.fonts?.ready.then(() => active && check());
    const observer = new ResizeObserver(check);
    observer.observe(row);
    for (const link of nav.children) observer.observe(link);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [rowRef, navRef, lang, compact]);

  return compact;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const lang = useLocale();
  const homePath = `/${lang}`;
  const rowRef = useRef(null);
  const navRef = useRef(null);
  const compact = useCompactNav(rowRef, navRef, lang);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    // Unthrottled is fine: it only flips a boolean and React bails on no-change.
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setOpen(false);
  };

  const navHref = (item) =>
    item.to.startsWith("#") || localesForPage(item.to).includes(lang)
      ? localePath(lang, item.to)
      : localePath(DEFAULT_LOCALE, item.to);

  const isActive = (item) => {
    if (item.to.startsWith("#")) {
      const currentHash = location.hash || "#home";
      return location.pathname === homePath && currentHash === item.to;
    }
    return location.pathname === navHref(item);
  };

  return (
    <header
      // fixed to the viewport edge, not text flow — stays physical
      className={cn(
        "fixed top-0 left-0 z-50 box-border w-full border-b border-white/10 bg-white/70 px-[clamp(1.5rem,6vw,6rem)] backdrop-blur-[8px] transition-[background-color,border-color,box-shadow,padding] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] max-xl:px-[clamp(1.2rem,5vw,2rem)] print:hidden",
        isScrolled &&
          "border-b-[rgba(0,0,0,0.06)] bg-white/85 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] backdrop-blur-[16px]",
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <div
          ref={rowRef}
          className={cn(
            "mx-auto grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-8 py-4 transition-[padding] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] max-xl:grid-cols-[auto_auto] max-xl:justify-between max-xl:py-3",
            compact && "grid-cols-[auto_auto] justify-between",
          )}
        >
          <div className="flex items-center gap-3">
            <NavLink to={localePath(lang, "#home")}>
              <img
                src={logo}
                alt={t("nav.logoAlt")}
                className="block w-[125px] transition-opacity duration-200 hover:opacity-85"
              />
            </NavLink>
          </div>

          <nav
            ref={navRef}
            aria-label={t("nav.primaryAria")}
            className={cn(
              "flex min-w-0 items-center justify-center gap-2 overflow-hidden max-xl:hidden",
              compact && "hidden",
            )}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={navHref(item)}
                className={() =>
                  cn(NAV_LINK, isActive(item) && NAV_LINK_ACTIVE)
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 justify-self-end max-xl:gap-1">
            <LanguageSwitcher variant="navbar" compact={compact} />
            <NavLink
              to="/get-started"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-brand-900 bg-brand-900 px-6 py-2.5 text-[0.9rem] font-semibold whitespace-nowrap text-white no-underline shadow-[0_4px_12px_rgba(15,23,42,0.15)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:border-neutral-800 hover:bg-neutral-800 hover:shadow-[0_6px_16px_rgba(15,23,42,0.2)] active:translate-y-px active:shadow-[0_2px_8px_rgba(15,23,42,0.15)] motion-reduce:hover:translate-y-0 max-xl:hidden",
                compact && "hidden",
              )}
            >
              {t("nav.getStarted")}
            </NavLink>

            <SheetTrigger asChild>
              <button
                className={cn(
                  "z-60 hidden cursor-pointer rounded-sm border-none bg-none p-2 text-brand-900 transition-colors duration-200 [-webkit-tap-highlight-color:transparent] hover:bg-[rgba(15,23,42,0.04)] max-xl:flex",
                  compact && "flex",
                )}
                aria-label={t("nav.toggle")}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  {/* Top Line */}
                  <path
                    className={cn(
                      BURGER_PATH,
                      open && "translate-y-[6px] rotate-45 [d:path('M3_6H21')]",
                    )}
                    d="M9 6H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Middle Line */}
                  <path
                    className={cn(BURGER_PATH, open && "opacity-0")}
                    d="M3 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Bottom Line */}
                  <path
                    className={cn(
                      BURGER_PATH,
                      open &&
                        "-translate-y-[6px] -rotate-45 [d:path('M3_18H21')]",
                    )}
                    d="M12 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </SheetTrigger>
          </div>
        </div>

        {/* Mobile drawer (right-side Sheet). */}
        <SheetContent
          side="right"
          overlayClassName="bg-text-main/40 backdrop-blur-[4px]"
          className="w-full gap-0 bg-bg-card px-6 pt-24 pb-10 sm:max-w-sm"
        >
          <SheetTitle className="sr-only">{t("nav.siteNavigation")}</SheetTitle>

          <nav aria-label={t("nav.mobileAria")} className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={navHref(item)}
                className={() =>
                  cn(MOBILE_LINK, isActive(item) && MOBILE_LINK_ACTIVE)
                }
                onClick={handleNavClick}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/get-started"
            className="mx-auto mt-auto box-border flex w-full max-w-[320px] items-center justify-center self-stretch rounded-full border-none bg-brand-900 px-6 py-4 text-center text-[1.1rem] font-semibold whitespace-nowrap text-white no-underline shadow-[0_12px_32px_-8px_rgba(15,23,42,0.3)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96] active:shadow-[0_4px_12px_rgba(15,23,42,0.15)]"
            onClick={handleNavClick}
          >
            {t("nav.getStarted")}
          </NavLink>

          <div className="mt-8 w-full text-center text-[0.85rem] font-medium text-neutral-400">
            {t("copyright", { year: new Date().getFullYear() })}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
