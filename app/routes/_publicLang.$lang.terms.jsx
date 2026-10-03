import { buildMeta, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { nsT, seoT } from "@/i18n/i18n";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export { TermsAndConditions as default } from "@/features/legal/TermsAndConditions";

export const handle = { i18n: ["legal", "legalTerms"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "legalTerms");
  return buildMeta({
    lang,
    path: "/terms",
    title: t("meta.title"),
    description: t("meta.description"),
    jsonLd: [
      webPageSchema({
        lang,
        path: "/terms",
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
        dateModified: "2026-09-08",
      }),
      breadcrumbSchema(lang, seoT(lang)("homeCrumb"), [
        { name: t("meta.crumb"), path: "/terms" },
      ]),
    ],
  });
});
