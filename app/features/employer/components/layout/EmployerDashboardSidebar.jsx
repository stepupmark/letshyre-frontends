import { useState, useCallback } from "react";
import { NavLink, Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import {
  LayoutGrid,
  Briefcase,
  ListTodo,
  Users,
  FileText,
  LogOut,
  User,
} from "lucide-react";

import logo from "@/assets/logo2.webp";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCloseOnDesktop } from "@/hooks/useCloseOnDesktop";
import { cn } from "@/lib/utils";
import { dirFor } from "@/i18n/config";
import { useAppLocale } from "@/i18n/appLocale";

const NAV_ITEM =
  "flex w-full items-center gap-3.5 rounded-md px-4.5 py-3.5 text-base font-medium no-underline transition-all duration-200";
// Branch idle/active rather than layering a competing hover: on the active
// state, where equal specificity would leave the winner to Tailwind's ordering.
const NAV_ITEM_IDLE =
  "text-neutral-500 [&_svg]:text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 hover:translate-x-1 hover:[&_svg]:text-brand-500 motion-reduce:hover:translate-x-0";
const NAV_ITEM_ACTIVE =
  "bg-brand-600 font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] [&_svg]:text-white";

// Shared verbatim between the desktop <aside> and the mobile Sheet so the two
// can't drift; SIDEBAR is the desktop column, SIDEBAR_DRAWER the Sheet.
const SIDEBAR_INNER =
  "flex flex-col overflow-y-auto border border-border-soft bg-card px-4 py-5 shadow-sm";
const SIDEBAR = cn(SIDEBAR_INNER, "flex-[0_0_300px] rounded-md max-lg:hidden");
const SIDEBAR_DRAWER = cn(
  SIDEBAR_INNER,
  "w-[85vw] max-w-75 gap-0 rounded-s-none rounded-e-lg pb-7.5 shadow-[10px_0_30px_rgba(0,0,0,0.1)] sm:max-w-75",
);

const MENU_ITEMS = [
  {
    id: "tour-dashboard",
    to: "/employer/dashboard",
    icon: LayoutGrid,
    labelKey: "nav.dashboard",
  },
  {
    id: "tour-postjob",
    to: "/employer/post-job",
    icon: Briefcase,
    labelKey: "nav.postJob",
  },
  {
    id: "tour-jobs",
    to: "/employer/view-jobs",
    icon: ListTodo,
    labelKey: "nav.viewJobs",
  },
  {
    id: "tour-candidates",
    to: "/employer/candidate-pool",
    icon: Users,
    labelKey: "nav.candidatePool",
  },
  {
    id: "tour-unlocked-candidates",
    to: "/employer/unlocked-candidates",
    icon: Users,
    labelKey: "nav.unlockedCandidates",
  },
  {
    id: "tour-team",
    to: "/employer/your-team",
    icon: Users,
    labelKey: "nav.yourTeam",
  },
  {
    id: "tour-billing",
    to: "/employer/invoice",
    icon: FileText,
    labelKey: "nav.invoiceHistory",
  },
];

export function EmployerDashboardSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  menuButtonRef,
  onRequestLogout,
}) {
  const location = useLocation();
  const { t } = useTranslation("dashboard");
  const { locale } = useAppLocale();
  const drawerSide = dirFor(locale) === "rtl" ? "right" : "left";

  const normalizePath = (path) => {
    if (path === "/employer" || path === "/employer/")
      return "/employer/dashboard";
    return path;
  };

  const [activeMenu, setActiveMenu] = useState(normalizePath(location.pathname));

  // Sync activeMenu on URL change, without an effect: setState during render
  // when the pathname has moved is React's documented pattern for resetting
  // state on prop change (https://react.dev/learn/you-might-not-need-an-effect).
  const [syncedPathname, setSyncedPathname] = useState(location.pathname);
  if (location.pathname !== syncedPathname) {
    setSyncedPathname(location.pathname);
    setActiveMenu(normalizePath(location.pathname));
  }

  const closeMobile = useCallback(
    () => setMobileMenuOpen(false),
    [setMobileMenuOpen],
  );
  useCloseOnDesktop(closeMobile);

  const handleNavClick = (to) => {
    setActiveMenu(to);
    closeMobile();
  };

  // Rendered twice (desktop <aside> + mobile Sheet) from one definition so they
  // can't drift. closeSlot is injected, not baked in: SheetClose reads Radix's
  // Dialog context and throws outside a Sheet, which would crash the desktop shell.
  const navBody = (closeSlot) => (
    <>
      <div className="mb-7.5 flex items-center justify-between">
        <Link to={"/employer/"}>
          <img src={logo} className="w-[65%] ps-2.5" alt={t("logo")} />
        </Link>
        {closeSlot}
      </div>

      <ul className="m-0 flex flex-1 list-none flex-col gap-2 p-0">
        <li className="hidden max-lg:block">
          <NavLink
            to="/employer/profile"
            prefetch="intent"
            className={cn(
              NAV_ITEM,
              location.pathname.includes("profile")
                ? NAV_ITEM_ACTIVE
                : NAV_ITEM_IDLE,
            )}
            onClick={closeMobile}
          >
            <User size={20} /> {t("nav.profile")}
          </NavLink>
        </li>
        {MENU_ITEMS.map(({ id, to, icon: Icon, labelKey }) => (
          <li key={id} id={id}>
            <NavLink
              to={to}
              prefetch="intent"
              className={cn(
                NAV_ITEM,
                activeMenu === to ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE,
              )}
              onClick={() => handleNavClick(to)}
            >
              <Icon size={20} /> {t(labelKey)}
            </NavLink>
          </li>
        ))}

        <li
          className="group mt-auto border-t border-border-soft pt-4"
          onClick={onRequestLogout}
        >
          <span
            className={cn(
              NAV_ITEM,
              "cursor-pointer text-danger [&_svg]:text-danger [&_span]:text-danger",
              "group-hover:bg-danger-bg group-hover:translate-x-0",
            )}
          >
            <LogOut size={20} />
            <span>{t("nav.logout")}</span>
          </span>
        </li>
      </ul>
    </>
  );

  return (
    <>
      <aside className={SIDEBAR}>{navBody(null)}</aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side={drawerSide}
          className={SIDEBAR_DRAWER}
          overlayClassName="bg-text-main/40 backdrop-blur-[2px]"
          showCloseButton={false}
          // Opener is a controlled button, not a SheetTrigger, so Radix has no
          // trigger to restore focus to — return it to the button ourselves.
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            menuButtonRef.current?.focus();
          }}
        >
          <SheetTitle className="sr-only">{t("aria.mainNav")}</SheetTitle>
          {navBody(
            <SheetClose className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-lg text-neutral-500">
              ✕<span className="sr-only">{t("aria.closeNav")}</span>
            </SheetClose>,
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
