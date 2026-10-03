import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { AuthProgress } from "./AuthProgress";
import { AppLanguageSwitcher } from "@/components/common/AppLanguageSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared auth shell: illustration left, card right (illustration hidden below
// lg). Used by Login, Register, Forgot-Password. Wizard flows pass onBack and/or
// progress to render a chrome row above the card; Login passes neither.
// imageFit "cover" (default) fills the pane; "contain" fits the whole graphic.
export function AuthShell({
  image,
  children,
  onBack = null,
  progress = null,
  imageFit = "cover",
}) {
  const { t } = useTranslation("auth");
  const hasChrome = onBack || progress;

  return (
    // Above min-[100em]: (1600px) the split stops stretching edge-to-edge and
    // the shell becomes a centered, rounded card.
    <div className="relative flex h-dvh box-border overflow-hidden bg-bg-page min-[100em]:items-center min-[100em]:justify-center min-[100em]:px-[clamp(3rem,5vw,8rem)] min-[100em]:py-[clamp(2.5rem,4vh,5rem)]">
      <AppLanguageSwitcher triggerClassName="absolute top-4 end-4 z-20 bg-card/80 backdrop-blur-sm" />
      <div className="grid min-h-0 flex-1 grid-cols-2 max-lg:grid-cols-1 min-[100em]:h-[min(680px,100%)] min-[100em]:w-full min-[100em]:max-w-[1320px] min-[100em]:flex-[0_1_auto] min-[100em]:overflow-hidden min-[100em]:rounded-xl min-[100em]:bg-card min-[100em]:shadow-xl">
        {/* ILLUSTRATION (decorative — hidden below lg) */}
        <div
          className={cn(
            "flex h-full items-center justify-center overflow-hidden bg-bg-subtle max-lg:hidden",
            // "contain": show the whole graphic with padding instead of cropping.
            imageFit === "contain" && "p-[clamp(1.5rem,4vw,3.5rem)]",
          )}
        >
          <img
            className={cn(
              "block h-full w-full object-cover",
              imageFit === "contain" && "h-auto max-w-140 object-contain",
            )}
            src={image}
            alt=""
          loading="lazy" decoding="async" />
        </div>

        {/* FORM PANE — fills the right half; the card is centered within it.
            The before/after pseudo-elements are weighted flex spacers (mobile
            only): grow-4 above / grow-5 below sits the form just above vertical
            center on a tall phone, collapsing (and letting the pane scroll)
            when a step outgrows the screen. */}
        <div className="flex h-full items-center justify-center overflow-y-auto p-[clamp(1.5rem,3vw,3rem)] max-sm:flex-col max-sm:items-center max-sm:justify-start max-sm:px-4 max-sm:py-5 max-sm:before:shrink-0 max-sm:before:grow-4 max-sm:before:content-[''] max-sm:after:shrink-0 max-sm:after:grow-5 max-sm:after:content-['']">
          <div className="box-border w-[min(440px,100%)]">
            {hasChrome && (
              <div className="mb-6 flex items-center justify-between gap-4">
                {onBack ? (
                  <Button
                    type="button"
                    className="-ms-1.5 h-auto gap-1.5 rounded-sm bg-transparent py-1.5 pe-2.5 ps-1.5 text-sm font-semibold text-neutral-500 hover:bg-bg-subtle hover:text-text-main"
                    onClick={onBack}
                    aria-label={t("backAria")}
                  >
                    <ArrowLeft size={18} aria-hidden="true" className="rtl:-scale-x-100" />
                    <span>{t("back")}</span>
                  </Button>
                ) : (
                  // Spacer: keeps the progress right-aligned in the justify-between row.
                  <span aria-hidden="true" />
                )}
                {progress && (
                  <AuthProgress
                    current={progress.current}
                    total={progress.total}
                  />
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
