import { buildMeta, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { nsT, seoT } from "@/i18n/i18n";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["contact"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

export { Contact as default } from "@/features/contact/Contact";

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "contact");
  return buildMeta({
    lang,
    path: "/contact",
    title: t("meta.title"),
    description: t("meta.description"),
    jsonLd: [
      webPageSchema({
        type: "ContactPage",
        lang,
        path: "/contact",
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
      }),
      breadcrumbSchema(lang, seoT(lang)("homeCrumb"), [{ name: t("meta.crumb"), path: "/contact" }]),
    ],
  });
});
