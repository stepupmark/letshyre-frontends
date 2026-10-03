import { SITE, buildMeta, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { nsT, seoT } from "@/i18n/i18n";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["download"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

export { DownloadApp as default } from "@/features/employee/DownloadApp";

const desktopAppSchema = (t) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LetsHyre Desktop App",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Windows",
  description: t("meta.schemaDescription"),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
  publisher: { "@id": `${SITE.url}/#organization` },
});

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "download");
  return buildMeta({
    lang,
    path: "/download",
    title: t("meta.title"),
    description: t("meta.description"),
    jsonLd: [
      desktopAppSchema(t),
      webPageSchema({
        lang,
        path: "/download",
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
      }),
      breadcrumbSchema(lang, seoT(lang)("homeCrumb"), [{ name: t("meta.crumb"), path: "/download" }]),
    ],
  });
});
