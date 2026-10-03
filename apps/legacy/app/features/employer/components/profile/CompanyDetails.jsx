import React from "react";
import { Building, Globe, FileText, Receipt, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { safeUrl } from "@/lib/safeUrl";
import { BIcon } from "@/components/icons/BootstrapIcons";

export const CompanyDetails = ({ kyc }) => {
  const { t } = useTranslation("employer");
  const val = (field) => {
    if (field === null || field === undefined || field === "") {
      return t("profile.na");
    }
    return field;
  };

  return (
    <section className="rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md max-md:p-6" aria-labelledby="company-details-heading">
      <h3 id="company-details-heading" className="relative mt-0 mb-8 inline-block text-lg font-semibold text-text-main after:absolute after:-bottom-2 after:start-0 after:h-0.75 after:w-10 after:rounded-[2px] after:bg-brand-600 after:content-['']">
        {t("profile.company.heading")}
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <Building size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.companyName")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(kyc?.company_name)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Globe size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.website")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">
                {kyc?.company_website ? (
                  <a href={safeUrl(kyc.company_website)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 no-underline hover:underline">
                    {kyc.company_website}
                  </a>
                ) : (
                  t("profile.na")
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <FileText size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.registrationNumber")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(kyc?.company_registration_number)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Receipt size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.gstNumber")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(kyc?.gst_number)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <CreditCard size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.panNumber")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(kyc?.pan_number)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true">
              <BIcon name="geo-alt" />
            </span>
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.address")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(kyc?.company_address)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">

          <div className="flex items-start gap-4">
            <span className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true">
              <BIcon name="linkedin" />
            </span>
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.linkedin")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">
                {kyc?.linkedin_url ? (
                  <a href={safeUrl(kyc.linkedin_url)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 no-underline hover:underline">
                    {t("profile.company.viewProfile")}
                  </a>
                ) : (
                  t("profile.na")
                )}
              </p>
            </div>
          </div>
        </div>

        <div className={cn("flex flex-col gap-8", "col-span-full")}>
          <div className={cn("flex items-start gap-4", "w-full")}>
            <span className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true">
              <BIcon name="info-circle" />
            </span>
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.company.description")}</span>
              <p className={cn("m-0 text-sm font-normal break-words text-text-main", "text-justify leading-[1.6] text-neutral-500")}>{val(kyc?.company_description)}</p>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};
