import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { HelpCircle, User, Menu } from "lucide-react";

import { AppLanguageSwitcher } from "@/components/common/AppLanguageSwitcher";
import { AssistantLink } from "@/components/common/AssistantLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOP_ICON =
  "flex size-11 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-border bg-bg-subtle text-lg text-neutral-500 transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-brand-600 hover:text-white hover:shadow-[0_6px_14px_rgba(37,99,235,0.25)] motion-reduce:hover:translate-y-0 max-lg:size-9.5 max-lg:text-base";
const TOP_ICON_ACTIVE =
  "-translate-y-0.5 border-transparent bg-brand-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.25)]";

const TOPBAR_BTN =
  "h-auto gap-2 rounded-md border-none px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 max-lg:px-3.5 max-lg:py-2";
const TOPBAR_BTN_DARK =
  "bg-neutral-800 text-white hover:bg-neutral-800 hover:shadow-[0_6px_16px_rgba(30,41,59,0.25)]";
const TOPBAR_BTN_BRAND =
  "bg-brand-600 text-white hover:bg-brand-600 hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)]";
const TOPBAR_SK = "skeleton-shimmer-inverse inline-block h-4 w-15 rounded-sm";

export function EmployerDashboardTopbar({
  credits,
  creditsLoading,
  teamCount,
  teamLoading,
  profileData,
  startTour,
  menuButtonRef,
  onOpenMobileMenu,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("dashboard");

  return (
    <div className="flex shrink-0 items-center justify-end rounded-md border border-border-soft bg-card px-5 py-3 shadow-sm max-lg:sticky max-lg:top-0 max-lg:z-50 max-lg:rounded-none max-lg:border-0 max-lg:border-b max-lg:shadow-none max-sm:px-4 max-sm:py-2.5">
      <div className="flex items-center gap-5 max-lg:gap-3">
        <AssistantLink to="/employer/chatbot" label={t("nav.assistant")} />
        {/* id="tour-credits": a Joyride target (renders a real <button>). */}
        <Button
          className={cn(TOPBAR_BTN, TOPBAR_BTN_BRAND, "max-md:hidden")}
          id="tour-credits"
          onClick={() => navigate("/employer/dashboard")}
        >
          {creditsLoading ? (
            <span className={TOPBAR_SK}></span>
          ) : (
            t("employer.credits", { count: credits })
          )}
        </Button>
        <Button
          className={cn(TOPBAR_BTN, TOPBAR_BTN_DARK, "max-md:hidden")}
          id="tour-add-member"
          onClick={() => navigate("/employer/your-team")}
        >
          {teamLoading ? (
            <span className={TOPBAR_SK}></span>
          ) : (
            t("employer.member", { count: teamCount + 1 })
          )}
        </Button>
        <div
          className={cn(TOP_ICON, "max-md:hidden")}
          role="button"
          tabIndex={0}
          title={t("employer.replayTour")}
          onClick={startTour}
        >
          <HelpCircle size={22} />
        </div>
        <AppLanguageSwitcher variant="toolbar" />
        {/* Hidden below lg (the profile icon lives in the sidebar there). */}
        <div
          className={cn(
            TOP_ICON,
            "max-lg:hidden",
            location.pathname.includes("profile") && TOP_ICON_ACTIVE,
          )}
          id="tour-profile"
          onClick={() => navigate("/employer/profile")}
        >
          {profileData?.company_logo ? (
            <img
              src={profileData.company_logo}
              alt={t("employer.profileAlt")}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <User size={22} />
          )}
        </div>

        <button
          ref={menuButtonRef}
          className="hidden cursor-pointer border-none bg-transparent text-neutral-800 max-lg:block"
          onClick={onOpenMobileMenu}
          aria-label={t("aria.openMenu")}
        >
          <Menu size={26} />
        </button>
      </div>
    </div>
  );
}
