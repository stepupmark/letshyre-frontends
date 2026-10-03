import React from "react";
import { useTranslation } from "react-i18next";
import { PolicyLayout } from "@/features/legal/components/PolicyLayout";
import { PolicyBlocks } from "@/features/legal/components/PolicyBlocks";

export function PrivacyPolicy() {
  const { t } = useTranslation("legalPolicy");
  const doc = t("policy", { returnObjects: true });

  const sections = doc.sections.map((section) => ({
    id: section.id,
    title: section.title,
    content: <PolicyBlocks blocks={section.blocks} />,
  }));

  // intro is two paragraphs (see en/legal.json policy.intro) joined by the
  // blank-line spacing the original hardcoded <br/><br/> gave them.
  const intro = Array.isArray(doc.intro) ? (
    <>
      {doc.intro.map((paragraph, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <>
              <br />
              <br />
            </>
          )}
          {paragraph}
        </React.Fragment>
      ))}
    </>
  ) : (
    <>{doc.intro}</>
  );

  return <PolicyLayout title={doc.title} intro={intro} sections={sections} />;
}
