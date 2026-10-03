import React from "react";
import { useTranslation } from "react-i18next";
import { PolicyLayout } from "@/features/legal/components/PolicyLayout";
import { PolicyBlocks } from "@/features/legal/components/PolicyBlocks";

export function RefundPolicy() {
  const { t } = useTranslation("legalRefund");
  const doc = t("refund", { returnObjects: true });

  const sections = doc.sections.map((section) => ({
    id: section.id,
    title: section.title,
    content: <PolicyBlocks blocks={section.blocks} />,
  }));

  return <PolicyLayout title={doc.title} intro={doc.intro} sections={sections} />;
}
