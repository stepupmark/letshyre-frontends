import React from "react";
import { useTranslation } from "react-i18next";
import img01 from "@/assets/emp-profile.webp";
import img02 from "@/assets/emp-profile02.webp";
import { Button } from "@/components/ui/button";


export const ProfileBanner = ({ companyName, stats, onEditClick }) => {
  const { t } = useTranslation("employer");
  return (
    <section className="relative h-60 overflow-hidden rounded-md bg-gradient-to-b from-card to-brand-400 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(ellipse_at_50%_-20%,rgba(255,255,255,0.6)_0%,transparent_65%)] before:content-[''] max-lg:h-53.75 max-md:flex max-md:h-auto max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-2.5 max-md:rounded-lg max-md:px-5 max-md:pt-6 max-md:pb-5 max-sm:gap-2 max-sm:px-4 max-sm:pt-5 max-sm:pb-4" aria-label={t("profile.banner.aria")}>
      {/* Side image is intentionally not mirrored in RTL (see object-position note below), so its container stays physically left-anchored too */}
      <div className="absolute top-0 bottom-1.25 left-0 z-1 w-75 overflow-hidden max-lg:w-65 max-md:hidden">
        {/* `.ep-banner-side-image` had no rule in the stylesheet; dropped. */}
        <img
          src={img01}
          alt={t("profile.banner.sideAlt")}
          // object-position has no inline-start/end logical CSS property, so the rtl: variant swaps the focal corner instead
          className="absolute bottom-0 left-0 block h-full w-full object-contain object-left-bottom rtl:object-right-bottom"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        loading="lazy" decoding="async" />
      </div>

      {/* Fixed-width center well sized against the two physically-positioned side images above/below; stays physical to keep matching their edges rather than drift out of alignment in RTL */}
      <div className="absolute inset-y-0 right-45 left-55 z-2 flex flex-col items-center justify-center gap-2.5 px-5 text-center max-lg:right-35 max-lg:left-45 max-md:static max-md:inset-auto max-md:w-full max-md:p-0">
        <h2 className="m-0 text-2xl font-bold tracking-[-0.3px] whitespace-nowrap text-brand-700 max-md:text-lg max-md:whitespace-normal max-sm:text-base">{companyName || t("profile.banner.defaultCompany")}</h2>
        <p className="max-w-90 text-center text-sm leading-normal font-medium text-neutral-500 max-md:text-xs max-sm:max-w-70">
          {t("profile.banner.blurb")}
        </p>

        <Button
          className="h-auto rounded-sm bg-text-main px-7 py-2.25 text-sm font-semibold tracking-wide text-white shadow-lg transition-all hover:bg-text-main hover:shadow-xl max-sm:px-5.5 max-sm:py-2 max-sm:text-xs"
          aria-label={t("profile.banner.editAria")}
          onClick={onEditClick}
        >
          {t("profile.banner.editProfile")}
        </Button>

        <div className="flex items-center gap-0 max-md:w-full max-md:justify-center max-sm:px-0.5 max-sm:py-1">
          <div className="flex flex-col gap-0.75 px-7 py-1 text-center whitespace-nowrap not-last:border-e-[1.5px] not-last:border-e-[rgba(26,58,110,0.25)] max-md:px-4 max-sm:px-2.5">
            <span className="text-xl leading-[1.1] font-extrabold text-brand-800 max-sm:text-base">{stats?.totalJobs || 0}</span>
            <span className="text-xs font-bold tracking-[0.2px] capitalize text-brand-800 max-sm:text-[9.5px]">{t("profile.banner.jobsPosted")}</span>
          </div>
          <div className="flex flex-col gap-0.75 px-7 py-1 text-center whitespace-nowrap not-last:border-e-[1.5px] not-last:border-e-[rgba(26,58,110,0.25)] max-md:px-4 max-sm:px-2.5">
            <span className="text-xl leading-[1.1] font-extrabold text-brand-800 max-sm:text-base">{stats?.openJobs || 0}</span>
            <span className="text-xs font-bold tracking-[0.2px] capitalize text-brand-800 max-sm:text-[9.5px]">{t("profile.banner.activeJobs")}</span>
          </div>
          <div className="flex flex-col gap-0.75 px-7 py-1 text-center whitespace-nowrap not-last:border-e-[1.5px] not-last:border-e-[rgba(26,58,110,0.25)] max-md:px-4 max-sm:px-2.5">
            <span className="text-xl leading-[1.1] font-extrabold text-brand-800 max-sm:text-base">0</span>
            <span className="text-xs font-bold tracking-[0.2px] capitalize text-brand-800 max-sm:text-[9.5px]">{t("profile.banner.matches")}</span>
          </div>
          <div className="flex flex-col gap-0.75 px-7 py-1 text-center whitespace-nowrap not-last:border-e-[1.5px] not-last:border-e-[rgba(26,58,110,0.25)] max-md:px-4 max-sm:px-2.5">
            <span className="text-xl leading-[1.1] font-extrabold text-brand-800 max-sm:text-base">0</span>
            <span className="text-xs font-bold tracking-[0.2px] capitalize text-brand-800 max-sm:text-[9.5px]">{t("profile.banner.alreadyHired")}</span>
          </div>
        </div>
      </div>

      {/* Side image is intentionally not mirrored in RTL (see object-position note above), so its container stays physically right-anchored too */}
      <div className="absolute -top-10 -right-20 -bottom-10 z-1 w-75 overflow-visible max-lg:-right-16.25 max-lg:w-65 max-md:hidden">
        <img
          src={img02}
          alt={t("profile.banner.shapeAlt")}
          // object-position has no inline-start/end logical CSS property, so the rtl: variant swaps the focal side instead
          className="absolute top-0 right-0 block h-full w-auto object-contain object-right rtl:object-left"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        loading="lazy" decoding="async" />
      </div>
    </section>
  );
};
