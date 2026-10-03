import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import logo from "@/assets/logo2.webp";
import EmployeeLockedOverlay from "@/features/employee/components/layout/EmployeeLockedOverlay";
import { AppLanguageSwitcher } from "@/components/common/AppLanguageSwitcher";
import { AssistantLink } from "@/components/common/AssistantLink";

import LogoutModal from "@/components/layout/LogoutModal";

import { useEmployeeLogout } from "@/features/employee/hooks/useEmployeeLogout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCloseOnDesktop } from "@/hooks/useCloseOnDesktop";
import { cn } from "@/lib/utils";
import { preferredLocale } from "@/i18n/hooks";
import { loadCatalogs } from "@/i18n/loadCatalogs";
import { dirFor } from "@/i18n/config";
import { useAppLocale } from "@/i18n/appLocale";
import { initialsAvatar } from "@/features/employee/lib/avatar";
import {
  useCandidateProfile,
  CANDIDATE_PROFILE_KEY,
} from "@/features/employee/hooks/useCandidateProfile";
import {
  Briefcase,
  FileText,
  ClipboardList,
  BookOpenCheck,
  User,
  LogOut,
  Menu,
} from "lucide-react";

// Only shown while the profile is incomplete, so its code and copy load on demand.
const EmployeeOnboarding = lazy(() =>
  Promise.all([
    import("@/features/employee/components/profile/EmployeeOnboarding"),
    loadCatalogs(preferredLocale(), ["employeeOnboarding"]),
  ]).then(([mod]) => mod),
);

// The class constants below are shared between the loading and loaded branches,
// which render the same shell elements — a genuine second consumer, not aliases.
const PAGE =
  "h-dvh overflow-hidden bg-brand-100 max-lg:h-auto max-lg:min-h-dvh max-lg:overflow-visible max-lg:bg-bg-page";
const DASHBOARD =
  "mx-auto flex h-full max-w-400 gap-3 p-3 transition-[filter] duration-[350ms] ease-[ease] max-lg:block max-lg:h-auto max-lg:p-0";
// SIDEBAR_INNER is shared verbatim between the desktop <aside> and the mobile
// Sheet so the two can't drift; SIDEBAR is the desktop-only column.
const SIDEBAR_INNER = "flex flex-col bg-card px-4 py-5";
const SIDEBAR = cn(SIDEBAR_INNER, "flex-[0_0_300px] rounded-md max-lg:hidden");
/** `w-4/5` with no cap: Sheet's own `sm:max-w-sm` would clamp it at 384px,
 *  which the hand-rolled panel never did. */
const SIDEBAR_DRAWER = cn(SIDEBAR_INNER, "w-4/5 gap-0 sm:max-w-none");
const MAIN =
  "flex min-w-0 flex-1 flex-col overflow-hidden max-lg:block max-lg:overflow-visible";
const TOPBAR =
  "flex shrink-0 items-center justify-between rounded-md bg-card p-3 mb-3 max-lg:sticky max-lg:top-0 max-lg:z-50 max-lg:mb-0 max-lg:rounded-none max-lg:border-b max-lg:border-border-soft";
const SCROLL =
  "min-h-0 flex-1 overflow-y-auto scrollbar-thin max-lg:overflow-visible";
const CENTER =
  "min-h-full rounded-lg bg-bg-page p-5 max-lg:min-h-0 max-lg:rounded-none max-lg:p-4";
// The chatbot keeps the desktop shell on mobile too: one viewport-high column
// where only the messages scroll and the composer stays at the bottom.
const CHAT_PAGE = "max-lg:h-dvh max-lg:overflow-hidden";
const CHAT_DASHBOARD = "max-lg:flex max-lg:h-full";
const CHAT_MAIN = "max-lg:flex max-lg:overflow-hidden";
const CHAT_SCROLL = "overflow-hidden max-lg:overflow-hidden";

const SK_BONE = "skeleton-shimmer-brand";

// Hover lives on IDLE, not overridden on ACTIVE: reproduces the source's
// a:hover:not(.active) exactly, where two competing hovers would leave the
// winner to Tailwind's utility ordering.
const NAV_LINK =
  "flex w-full items-center gap-3.5 rounded-md px-4.5 py-3.5 text-base font-medium no-underline transition-all duration-200";
const NAV_LINK_IDLE =
  "text-text-muted hover:bg-brand-100 hover:text-employee-accent";
const NAV_LINK_ACTIVE =
  "bg-employee-accent text-white shadow-[0_4px_12px_rgba(59,109,240,0.3)]";
const NAV_LOCKED = "pointer-events-none cursor-not-allowed opacity-45";

export function EmployeeDashboardLayout() {
  const [showProfileFlow, setShowProfileFlow] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslation("dashboard");
  const { locale } = useAppLocale();
  const drawerSide = dirFor(locale) === "rtl" ? "right" : "left";

  const { data: userData, isLoading } = useCandidateProfile();

  const profileCompleted = userData?.is_profile_complete === true;

  // The chatbot page fills the content area and manages its own internal scroll,
  // so on desktop the section becomes a flex column it can stretch into. Other
  // pages keep the default block flow.
  const isChat = location.pathname.startsWith("/employee/chatbot");

  const handleProfileComplete = () => {
    // Immediately patch the cache so profileCompleted flips to true on this render.
    queryClient.setQueryData(CANDIDATE_PROFILE_KEY, (old) =>
      old ? { ...old, is_profile_complete: true } : old,
    );
    // Mark stale so the next focus/navigation refetches — but not now, or it
    // would race and overwrite the patch with stale server data.
    queryClient.invalidateQueries({
      queryKey: CANDIDATE_PROFILE_KEY,
      refetchType: "none",
    });
    setShowProfileFlow(false);
  };

  const { mutate: performLogout, isPending: isLoggingOut } =
    useEmployeeLogout();

  const menuButtonRef = useRef(null);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  useCloseOnDesktop(closeMobileMenu);

  if (isLoading) {
    return (
      <div className={PAGE}>
        <div className={DASHBOARD}>
          <aside className={SIDEBAR}>
            <Skeleton className={cn(SK_BONE, "mt-5 mb-10 h-7.5 w-30")} />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className={cn(SK_BONE, "mb-4 h-12 w-full")} />
            ))}
          </aside>

          <main className={MAIN}>
            <header className={TOPBAR}>
              <Skeleton className={cn(SK_BONE, "h-6 w-50")} />
              <Skeleton className={cn(SK_BONE, "size-11.5 rounded-full")} />
            </header>

            <div className={SCROLL}>
              <section className={CENTER}>
                <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className={cn(SK_BONE, "h-35 rounded-lg")}
                    />
                  ))}
                </div>
                <Skeleton className={cn(SK_BONE, "h-75 w-full rounded-lg")} />
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Rendered twice (desktop <aside> + mobile Sheet) from one definition so they
  // can't drift. closeSlot is injected, not baked in: SheetClose reads Radix's
  // Dialog context and throws outside a Sheet, which would crash the desktop
  // shell — so desktop passes null and only the drawer gets a close control.
  const navBody = (closeSlot) => (
    <>
      <div className="mt-5 mb-10 flex items-center justify-between text-xl font-bold text-employee-accent">
        <Link to={"/employee/find-jobs"}>
          <img src={logo} alt={t("logo")} className="w-[70%]" />
        </Link>

        {closeSlot}
      </div>

      <ul className="flex h-full list-none flex-col gap-4 p-0">
        <li>
          <NavLink
            to="/employee/find-jobs"
            prefetch="intent"
            className={({ isActive }) =>
              cn(
                NAV_LINK,
                isActive ||
                  location.pathname === "/employee" ||
                  location.pathname === "/employee/"
                  ? NAV_LINK_ACTIVE
                  : NAV_LINK_IDLE,
              )
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <Briefcase size={20} /> {t("nav.findJobs")}
          </NavLink>
        </li>

        <li className={cn(!profileCompleted && NAV_LOCKED)}>
          <NavLink
            to={profileCompleted ? "/employee/my-applications" : "#"}
            prefetch={profileCompleted ? "intent" : "none"}
            className={({ isActive }) =>
              cn(NAV_LINK, isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE)
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <FileText size={20} /> {t("nav.myApplications")}
          </NavLink>
        </li>

        <li className={cn(!profileCompleted && NAV_LOCKED)}>
          <NavLink
            to={profileCompleted ? "/employee/score-cards-list" : "#"}
            prefetch={profileCompleted ? "intent" : "none"}
            className={({ isActive }) =>
              cn(NAV_LINK, isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE)
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <ClipboardList size={20} /> {t("nav.scorecard")}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/employee/interview-guide"
            prefetch="intent"
            className={({ isActive }) =>
              cn(NAV_LINK, isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE)
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <BookOpenCheck size={20} /> {t("nav.interviewGuide")}
          </NavLink>
        </li>

        <li className="hidden max-lg:block">
          <NavLink
            to="/employee/profile"
            prefetch="intent"
            className={({ isActive }) =>
              cn(NAV_LINK, isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE)
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={20} /> {t("nav.profile")}
          </NavLink>
        </li>

        <li
          className="mt-auto flex cursor-pointer items-center gap-3.5 rounded-md px-4.5 py-3.5 text-base font-medium text-danger hover:bg-danger-bg"
          onClick={() => {
            setShowLogoutModal(true);
          }}
        >
          <LogOut size={20} /> {t("nav.logout")}
        </li>
      </ul>
    </>
  );

  return (
    <div className={cn(PAGE, isChat && CHAT_PAGE)}>
      <div
        className={cn(
          DASHBOARD,
          isChat && CHAT_DASHBOARD,
          !profileCompleted && "pointer-events-none blur-[2px] brightness-85",
        )}
      >
        {/* LEFT SIDEBAR (desktop); the mobile drawer below renders the same navBody. */}
        <aside className={SIDEBAR}>{navBody(null)}</aside>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side={drawerSide}
            className={SIDEBAR_DRAWER}
            overlayClassName="bg-text-main/45"
            showCloseButton={false}
            // Opener is a controlled button, not a SheetTrigger, so Radix has no
            // trigger to restore focus to — return it to the menu button ourselves.
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              menuButtonRef.current?.focus();
            }}
          >
            <SheetTitle className="sr-only">{t("aria.mainNav")}</SheetTitle>
            {navBody(
              <SheetClose className="cursor-pointer text-2xl text-text-body">
                ✕<span className="sr-only">{t("aria.closeNav")}</span>
              </SheetClose>,
            )}
          </SheetContent>
        </Sheet>

        {/* MAIN CONTENT */}
        <main className={cn(MAIN, isChat && CHAT_MAIN)}>
          <header className={TOPBAR}>
            <div className="hidden items-center gap-3 max-lg:flex">
              <Link to={"/employee/find-jobs"}>
                <img src={logo} className="me-0.5 h-8" alt={t("logo")} />
              </Link>
            </div>

            <div className="ms-auto flex items-center justify-end gap-3 max-lg:gap-2.5">
              <AssistantLink to="/employee/chatbot" label={t("nav.assistant")} />
              <AppLanguageSwitcher variant="toolbar" />
              <div
                className="group me-3.75 flex min-w-auto cursor-pointer select-none items-center justify-center rounded-full border-none bg-transparent p-0 focus:outline-2 focus:outline-offset-2 focus:outline-brand-500 max-lg:hidden"
                onClick={() => navigate("/employee/profile")}
                role="button"
                tabIndex={0}
                aria-label={t("aria.openProfile")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate("/employee/profile");
                  }
                }}
              >
                <div className="relative shrink-0">
                  <img
                    src={
                      userData?.profile_photo ||
                      initialsAvatar(userData?.name || "User")
                    }
                    alt={t("aria.userAvatar")}
                    className="block size-11.5 rounded-full border-[3px] border-brand-500 object-cover shadow-[0_4px_10px_rgba(92,143,230,0.35)] transition-[transform,box-shadow] duration-250 ease-[ease] group-hover:scale-105 group-hover:shadow-[0_6px_14px_rgba(92,143,230,0.55)] max-sm:size-9.5"
                    onError={(e) => {
                      e.currentTarget.src = initialsAvatar(
                        userData?.name || "User",
                      );
                    }}
                  />
                </div>
              </div>
              {/* Mobile-only menu opener. */}
              <Button
                ref={menuButtonRef}
                variant="ghost"
                className="hidden h-auto w-auto p-0 hover:bg-transparent max-lg:flex"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={t("aria.openMenu")}
              >
                <Menu size={26} />
              </Button>
            </div>
          </header>

          <div className={cn(SCROLL, isChat && CHAT_SCROLL)}>
            <section
              className={cn(CENTER, isChat && "relative h-full overflow-hidden")}
              key={location.pathname}
              aria-label={t("aria.mainContent")}
            >
              <Outlet />
            </section>
          </div>
        </main>
      </div>

      {userData && !profileCompleted && !showProfileFlow && (
        <EmployeeLockedOverlay onAction={() => setShowProfileFlow(true)} />
      )}

      {userData && !profileCompleted && showProfileFlow && (
        <Dialog open>
          <DialogContent
            className="max-h-[95vh] w-[95%] max-w-300 gap-0 overflow-y-auto rounded-lg border-0 p-5 shadow-[0_35px_80px_rgba(0,0,0,0.35)] sm:max-w-300"
            overlayClassName="bg-text-main/[0.888]"
            showCloseButton={false}
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogTitle className="sr-only">
              {t("onboarding.title")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("onboarding.description")}
            </DialogDescription>
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
              <EmployeeOnboarding onComplete={handleProfileComplete} />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => performLogout()}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
