import React from "react";
import { User, Briefcase, Mail, Phone, MailCheck, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/** Selected at runtime from the KYC status, so it stays a lookup map rather
 *  than a class fixed on a tag. */
const EP_STATUS_TONE = {
  verified: "bg-success-bg text-success",
  pending: "bg-warning-bg text-warning",
  rejected: "bg-danger-bg text-danger",
};

export const PrimaryDetails = ({ profile, kyc, loggedUser }) => {
  const { t } = useTranslation("employer");
  const val = (field) => {
    if (field === null || field === undefined || field === "") {
      return t("profile.na");
    }
    return field;
  };

  return (
    <section className="rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md max-md:p-6" aria-labelledby="primary-details-heading">
      <h3 id="primary-details-heading" className="relative mt-0 mb-8 inline-block text-lg font-semibold text-text-main after:absolute after:-bottom-2 after:start-0 after:h-0.75 after:w-10 after:rounded-[2px] after:bg-brand-600 after:content-['']">
        {t("profile.primary.heading")}
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <User size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.primary.name")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(profile?.name || profile?.full_name || loggedUser?.name)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Briefcase size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.primary.industry")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(kyc?.company_industry)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <Mail size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.primary.email")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(profile?.email || loggedUser?.email)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.primary.phone")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(profile?.phone_number || profile?.phone || loggedUser?.phone_number)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <MailCheck size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.primary.officialEmail")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">{val(kyc?.official_email || loggedUser?.official_email)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <ShieldCheck size={16} className="flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600" aria-hidden="true" />
            <div>
              <span className="mb-1 block text-sm font-semibold text-text-muted">{t("profile.primary.kycStatus")}</span>
              <p className="m-0 text-sm font-normal break-words text-text-main">
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 text-sm font-semibold",
                    EP_STATUS_TONE[kyc?.kyc_status?.toLowerCase()] ??
                      EP_STATUS_TONE.pending,
                  )}
                >
                  {val(kyc?.kyc_status)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
