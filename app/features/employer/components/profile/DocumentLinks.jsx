import React from "react";
import { ExternalLink, FileText, FileCheck, FileUser } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BIcon } from "@/components/icons/BootstrapIcons";

export const DocumentLinks = ({ kyc }) => {
  const { t } = useTranslation("employer");
  const renderDocLink = (label, url, icon) => {
    if (!url) return null;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-md border border-border bg-bg-subtle p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:bg-card hover:shadow-sm">
        <div className="rounded-md bg-brand-100 p-3 text-brand-600">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-text-main">{label}</span>
          <span className="mt-1 text-xs text-brand-600">{t("profile.documents.viewDocument")} <ExternalLink size={14} /></span>
        </div>
      </a>
    );
  };

  // If no docs uploaded, return null
  if (
    !kyc?.registration_certificate &&
    !kyc?.gst_certificate &&
    !kyc?.address_proof &&
    !kyc?.bank_proof
  ) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md max-md:p-6" aria-labelledby="documents-heading">
      <h3 id="documents-heading" className="relative mt-0 mb-8 inline-block text-lg font-semibold text-text-main after:absolute after:-bottom-2 after:start-0 after:h-0.75 after:w-10 after:rounded-[2px] after:bg-brand-600 after:content-['']">
        {t("profile.documents.heading")}
      </h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {renderDocLink(t("profile.documents.registrationCertificate"), kyc?.registration_certificate, <FileText className="size-5" />)}
        {renderDocLink(t("profile.documents.gstCertificate"), kyc?.gst_certificate, <FileCheck className="size-5" />)}
        {renderDocLink(t("profile.documents.addressProof"), kyc?.address_proof, <FileUser className="size-5" />)}
        {renderDocLink(t("profile.documents.bankProof"), kyc?.bank_proof, <BIcon name="file-earmark-medical" className="size-5" />)}
      </div>
    </section>
  );
};
