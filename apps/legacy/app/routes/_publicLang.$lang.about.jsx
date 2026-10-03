import { buildMeta, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { nsT, seoT } from "@/i18n/i18n";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["about"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

export { About as default } from "@/features/about/About";

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "about");
  return buildMeta({
    lang,
    path: "/about",
    title: t("meta.title"),
    description: t("meta.description"),
    jsonLd: [
      webPageSchema({
        type: "AboutPage",
        lang,
        path: "/about",
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
      }),
      breadcrumbSchema(lang, seoT(lang)("homeCrumb"), [{ name: t("meta.crumb"), path: "/about" }]),
    ],
  });
});
