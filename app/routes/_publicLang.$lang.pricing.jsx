import { redirect } from "react-router";
import { buildMeta, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { nsT, seoT } from "@/i18n/i18n";
import { DEFAULT_LOCALE, isLocale, localePath, localesForPage } from "@/i18n/config";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";
import { queryClient } from "@/lib/queryClient";
import { pricingSchemas } from "@/features/pricing/lib/pricingSchema";
import { creditPriceQuery, publicPlansQuery } from "@/features/pricing/queries/pricing.queries";

export { Pricing as default } from "@/features/pricing/Pricing";
export { PricingError as ErrorBoundary } from "@/features/pricing/components/PricingError";

const PATH = "/pricing";

export const handle = { i18n: ["pricing"] };
// Prices are fetched in the browser only, so the prerendered page never
// carries a stale one.
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n, ({ params }) => {
  if (isLocale(params.lang) && !localesForPage(PATH).includes(params.lang)) {
    throw redirect(localePath(DEFAULT_LOCALE, PATH));
  }
  // Not awaited: prices load alongside the page instead of holding it up.
  void queryClient.prefetchQuery(publicPlansQuery());
  void queryClient.prefetchQuery(creditPriceQuery());
  return null;
});

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "pricing");
  return buildMeta({
    lang,
    path: PATH,
    title: t("meta.title"),
    description: t("meta.description"),
    jsonLd: [
      webPageSchema({
        lang,
        path: PATH,
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
      }),
      breadcrumbSchema(lang, seoT(lang)("homeCrumb"), [{ name: t("meta.crumb"), path: PATH }]),
      ...pricingSchemas(lang),
    ],
  });
});
