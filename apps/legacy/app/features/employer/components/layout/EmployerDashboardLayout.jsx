import { useState, useMemo, useRef, useCallback } from "react";
import { Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import {
  useEmployerProfile,
  useEmployerCredits,
  useTeamMembers,
} from "@/features/employer/hooks/useDashboard";
import { useLogout } from "@/hooks/useLogout";
import LogoutModal from "@/components/layout/LogoutModal";
import { EmployerDashboardSidebar } from "./EmployerDashboardSidebar";
import { EmployerDashboardTopbar } from "./EmployerDashboardTopbar";
import { TourOverlay } from "./EmployerDashboardTour";
import { makeTourSteps, useTour } from "./useEmployerDashboardTour";
import { cn } from "@/lib/utils";

export function EmployerDashboardLayout() {
  const location = useLocation();
  const { t } = useTranslation("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── React Query Hooks ──
  const { data: profileData, isLoading: profileLoading } = useEmployerProfile();
  const { data: creditsData, isLoading: creditsLoading } = useEmployerCredits();
  const { data: teamData, isLoading: teamLoading } = useTeamMembers();
  const logoutMutation = useLogout();

  const credits = creditsData?.available_credits || 0;
  const teamCount = teamData?.count || 0;

  const tourSteps = useMemo(() => makeTourSteps(t), [t]);
  // Auto-starts once data has settled so every step target is in the DOM before
  // Joyride looks for it. startTour is also the manual replay trigger.
  const {
    runTour,
    steps: activeTourSteps,
    highlight: tourHighlight,
    startTour,
    handleCallback,
  } = useTour({
    ready: !profileLoading && !creditsLoading && !teamLoading,
    allSteps: tourSteps,
  });

  const isChat = location.pathname.startsWith("/employer/chatbot");

  // Via the shared hook so the TanStack cache is cleared on logout.
  const handleLogout = () => {
    setShowLogoutModal(false);
    logoutMutation.mutate();
  };

  const menuButtonRef = useRef(null);
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);

  return (
    <div
      className={cn(
        "relative mx-auto flex h-dvh max-w-640 gap-3 overflow-hidden bg-bg-subtle p-3 max-lg:block max-lg:h-auto max-lg:min-h-dvh max-lg:overflow-visible max-lg:bg-bg-page max-lg:p-0",
        // On mobile too, the chatbot needs a viewport-high column so the
        // composer sits at the bottom and only the messages scroll.
        isChat && "max-lg:flex max-lg:h-dvh max-lg:overflow-hidden",
      )}
    >
      <TourOverlay
        steps={activeTourSteps}
        run={runTour}
        highlight={tourHighlight}
        onCallback={handleCallback}
      />

      <EmployerDashboardSidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        menuButtonRef={menuButtonRef}
        onRequestLogout={() => setShowLogoutModal(true)}
      />

      {/* ── MAIN ── */}
      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3 overflow-hidden max-lg:block max-lg:overflow-visible",
          isChat && "max-lg:flex max-lg:gap-0 max-lg:overflow-hidden",
        )}
      >
        <EmployerDashboardTopbar
          credits={credits}
          creditsLoading={creditsLoading}
          teamCount={teamCount}
          teamLoading={teamLoading}
          profileData={profileData}
          startTour={startTour}
          menuButtonRef={menuButtonRef}
          onOpenMobileMenu={openMobileMenu}
        />

        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-y-auto rounded-lg bg-bg-page p-5 max-lg:min-h-0 max-lg:overflow-visible max-lg:rounded-none max-lg:p-4",
            // The chatbot fills this box with an absolutely-positioned layer that
            // scrolls internally; stop this wrapper scrolling so there's one
            // scroll region, not two.
            isChat && "overflow-hidden max-lg:overflow-hidden",
          )}
        >
          <Outlet />
        </div>
      </main>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
