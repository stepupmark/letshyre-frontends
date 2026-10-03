import { buildMeta, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { nsT, seoT } from "@/i18n/i18n";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export { RefundPolicy as default } from "@/features/legal/RefundPolicy";

export const handle = { i18n: ["legal", "legalRefund"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "legalRefund");
  return buildMeta({
    lang,
    path: "/refund-policy",
    title: t("meta.title"),
    description: t("meta.description"),
    jsonLd: [
      webPageSchema({
        lang,
        path: "/refund-policy",
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
        dateModified: "2026-07-31",
      }),
      breadcrumbSchema(lang, seoT(lang)("homeCrumb"), [
        { name: t("meta.crumb"), path: "/refund-policy" },
      ]),
    ],
  });
});
