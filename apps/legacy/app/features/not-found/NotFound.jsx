import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const handleGoBack = () => navigate(-1);

  return (
    <div className="fixed inset-0 z-9999 flex min-h-screen items-center justify-center overflow-hidden bg-bg-subtle text-text-main">
      <main>
        <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full animate-mesh-flow bg-[radial-gradient(circle_at_15%_50%,rgba(37,99,235,0.08)_0%,transparent_50%),radial-gradient(circle_at_85%_30%,rgba(14,165,233,0.08)_0%,transparent_50%),radial-gradient(circle_at_50%_80%,rgba(56,189,248,0.06)_0%,transparent_50%)] blur-[60px] motion-reduce:animate-none"></div>

        <div className="relative z-10 w-full max-w-175 translate-y-7.5 animate-card-float-up p-8 text-center opacity-0 motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 max-md:px-6 max-md:py-10">
          <div className="relative mx-auto mb-8 flex size-20 animate-icon-pulse items-center justify-center rounded-xl bg-gradient-to-br from-card to-brand-100 shadow-[0_12px_24px_-8px_rgba(37,99,235,0.25),inset_0_0_0_1px_rgba(255,255,255,0.8)] after:absolute after:inset-[-2px] after:-z-1 after:rounded-[26px] after:bg-gradient-to-br after:from-brand-600 after:to-brand-500 after:opacity-30 after:blur-[10px] after:content-[''] motion-reduce:animate-none">
            <Compass className="size-9 text-brand-600" aria-hidden="true" />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-300/50 bg-brand-100/80 px-4 py-1.5 text-sm font-bold tracking-[0.08em] text-brand-600 uppercase">
            <span className="size-2 animate-dot-blink rounded-full bg-brand-600 shadow-[0_0_0_2px_rgba(59,130,246,0.2)] motion-reduce:animate-none"></span>
            {t("notFound.badge")}
          </div>

          <h1 className="mb-6 text-[clamp(2.25rem,4vw,3rem)] leading-[1.3] font-extrabold tracking-[-0.03em]">
            <span className="bg-gradient-to-br from-text-main to-neutral-700 bg-clip-text text-transparent">
              {t("notFound.title")}
            </span>
          </h1>
          <p className="mb-12 text-lg leading-[1.8] text-neutral-500">
            {t("notFound.body")}
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-md:flex-col">
            <Button
              onClick={() => navigate("/")}
              className="h-auto rounded-sm bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-brand-700 max-md:w-full"
            >
              <Home className="size-4.5" aria-hidden="true" />
              {t("notFound.goHome")}
            </Button>
            <Button
              onClick={handleGoBack}
              className="h-auto rounded-sm border border-border bg-card px-7 py-3.5 text-base font-semibold text-text-main transition-all hover:border-neutral-300 hover:bg-bg-subtle max-md:w-full"
            >
              <ArrowLeft className="size-4.5" aria-hidden="true" />
              {t("notFound.goBack")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
