import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  RefreshCw,
  Download,
  Hourglass,
  Monitor,
  // Command,
  HelpCircle,
} from "lucide-react";
import { useDesktopAppReleases } from "@/features/employee/hooks/useDesktopAppReleases";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Segment button sits above the framer-motion layoutId pill (a sibling animating
// behind it), so it stays relative/z-1. disabled:opacity-100 keeps the disabled
// state's own colours instead of the primitive's default fade.
const SEGMENT_CLASS =
  "relative z-1 h-9 flex-1 bg-transparent text-sm font-medium text-text-muted transition-colors hover:bg-transparent hover:text-text-main";
const SEGMENT_ACTIVE_CLASS = "font-semibold text-text-main";

const DA_BUTTON_BASE =
  "h-auto w-full gap-2 rounded-sm border border-transparent px-6 py-3 text-base font-semibold transition-all disabled:opacity-100";
const DA_BUTTON_PRIMARY =
  "bg-brand-600 text-white shadow-sm hover:-translate-y-px hover:bg-brand-700 hover:shadow-md active:translate-y-0";
const DA_BUTTON_DISABLED =
  "border-border-soft bg-neutral-100 text-neutral-400";
const OS_OPTIONS = [
  { id: "Windows", label: "Windows", icon: Monitor },
  // Restore once the macOS build ships.
  // { id: "Mac", label: "macOS", icon: Command },
];

export function DownloadApp() {
  const [os, setOs] = useState("Windows");
  const { t } = useTranslation("download");
  const { data: releases, isLoading, refetch } = useDesktopAppReleases();

  useEffect(() => {
    // window.navigator is only available client-side, so OS detection can't
    // happen during render (SSR-unsafe).
    const userAgent = window.navigator.userAgent.toLowerCase();
    const detected = userAgent.includes("mac") ? "Mac" : "Windows";
    // Anything we don't offer a build for stays on the Windows default.
    if (!OS_OPTIONS.some((o) => o.id === detected)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOs(detected);
  }, []);

  const hasReleases = Array.isArray(releases) && releases.length > 0;

  const activeRelease = releases?.find(
    (r) => r.platform?.toLowerCase() === os.toLowerCase()
  );

  const isAvailable = activeRelease?.available ?? false;

  const handleDownload = (e) => {
    e.preventDefault();
    if (!isAvailable) return;

    try {
      const downloadUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }commonapp/v1/desktop_app/${os.toLowerCase()}/download/`;

      const link = document.createElement("a");
      link.href = downloadUrl;

      const filename = activeRelease?.original_filename || `LetsHyre-${os}.exe`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to trigger download", error);
    }
  };

  const getDownloadText = () => {
    if (!isAvailable) return t("comingSoon");
    const label = OS_OPTIONS.find((o) => o.id === os)?.label ?? os;
    return t("downloadFor", { os: label });
  };

  const activeOsOption = OS_OPTIONS.find((o) => o.id === os);
  const ActiveIcon = activeOsOption ? activeOsOption.icon : Monitor;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    // pt-25 clears the global navbar.
    <div className="flex min-h-dvh flex-col bg-bg-page pt-25">
      {/* A <div>, not <main>: PublicLayout supplies the <main> landmark. */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <motion.div
          className="flex w-full max-w-130 flex-col items-center rounded-md border border-border-soft bg-card p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(0,0,0,0.02)] max-sm:px-5 max-sm:py-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="mb-6 text-center" variants={itemVariants}>
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-md border border-border-soft bg-neutral-100 text-text-main">
              <ActiveIcon size={28} strokeWidth={1.5} />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-text-main">
              {t("title")}
            </h1>
            <p className="max-w-95 text-base leading-normal text-text-muted">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* OS Selector Segmented Control */}
          <motion.div
            className="mb-6 flex w-full items-center rounded-sm bg-neutral-100 p-1"
            variants={itemVariants}
          >
            {OS_OPTIONS.map((option) => {
              const isActive = os === option.id;
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant="ghost"
                  onClick={() => setOs(option.id)}
                  className={cn(SEGMENT_CLASS, isActive && SEGMENT_ACTIVE_CLASS)}
                  type="button"
                >
                  {isActive && (
                    <motion.div
                      layoutId="os-pill"
                      className="absolute inset-0 -z-1 rounded-sm bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="flex items-center gap-1.5">
                    <Icon size={16} />
                    {option.label}
                  </span>
                </Button>
              );
            })}
          </motion.div>

          {/* Features */}
          <motion.div
            className="mb-8 flex w-full items-center justify-center gap-5 max-sm:flex-col max-sm:items-start max-sm:gap-3"
            variants={itemVariants}
          >
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
              <CheckCircle2 size={16} className="text-success" />
              <span>{t("features.distractionFree")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
              <CheckCircle2 size={16} className="text-success" />
              <span>{t("features.stable")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
              <CheckCircle2 size={16} className="text-success" />
              <span>{t("features.secure")}</span>
            </div>
          </motion.div>

          {/* Download Action */}
          <motion.div className="mb-6 w-full" variants={itemVariants}>
            {isLoading ? (
              <Button className={`${DA_BUTTON_BASE} bg-neutral-100 text-neutral-500`} disabled>
                <RefreshCw size={18} className="animate-spin motion-reduce:animate-none" />
                {t("loading")}
              </Button>
            ) : !hasReleases ? (
              // No release list means the lookup failed, was paused offline, or
              // came back empty — none of which say the build is unreleased.
              // Falling through here would tell Windows users "coming soon".
              <Button onClick={() => refetch()} className={cn(DA_BUTTON_BASE, DA_BUTTON_PRIMARY)}>
                <RefreshCw size={18} />
                {t("retry")}
              </Button>
            ) : (
              <Button
                onClick={isAvailable ? handleDownload : undefined}
                className={cn(DA_BUTTON_BASE, isAvailable ? DA_BUTTON_PRIMARY : DA_BUTTON_DISABLED)}
                disabled={!isAvailable}
              >
                {isAvailable ? <Download size={18} /> : <Hourglass size={18} />}
                {getDownloadText()}
              </Button>
            )}
          </motion.div>

          {/* Clean Stepper */}
          <motion.div
            className="flex w-full items-center justify-center gap-3 border-t border-border-soft pt-4"
            variants={itemVariants}
          >
            <div className="flex items-center gap-1.5 text-text-main">
              <span className="size-1.5 rounded-full bg-current" />
              <span className="text-xs font-semibold tracking-[0.05em] uppercase">
                {t("steps.download")}
              </span>
            </div>
            <div className="h-px max-w-10 flex-1 bg-border-soft" />
            <div className="flex items-center gap-1.5 text-neutral-500">
              <span className="size-1.5 rounded-full bg-current" />
              <span className="text-xs font-semibold tracking-[0.05em] uppercase">
                {t("steps.install")}
              </span>
            </div>
            <div className="h-px max-w-10 flex-1 bg-border-soft" />
            <div className="flex items-center gap-1.5 text-neutral-500">
              <span className="size-1.5 rounded-full bg-current" />
              <span className="text-xs font-semibold tracking-[0.05em] uppercase">
                {t("steps.interview")}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Support Link outside the main visual weight */}
        <motion.a
          href="/support"
          className="mt-6 flex items-center gap-1.5 text-sm font-medium text-text-muted no-underline transition-colors hover:text-text-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <HelpCircle size={16} />
          {t("support")}
        </motion.a>
      </div>
    </div>
  );
}
