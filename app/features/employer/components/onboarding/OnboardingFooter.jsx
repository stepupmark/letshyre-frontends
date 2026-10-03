import React from "react";
import { cn } from "@/lib/utils";

export const OnboardingFooter = ({ t, saveStatus, children }) => (
  <div className="sticky bottom-0 z-10 mt-2 flex items-center justify-end gap-3 border-t border-border-soft bg-card/95 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm max-sm:flex-col-reverse max-sm:items-stretch md:col-span-2">
    <span
      className={cn(
        "me-auto text-sm font-medium text-success transition-opacity duration-300 max-sm:hidden",
        saveStatus === "saved" ? "opacity-100" : "opacity-0",
      )}
      aria-live="polite"
    >
      {saveStatus === "saved" ? t("form.draftSaved") : ""}
    </span>
    {children}
  </div>
);
