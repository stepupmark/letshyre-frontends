import { ScrollToHash } from "@/components/ScrollToHash";
import { Home } from "@/features/home/Home";
import { SITE, buildMeta, webPageSchema } from "@/lib/seo";
import { nsT } from "@/i18n/i18n";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["home"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

const softwareSchema = (t) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: t("meta.schemaDescription"),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
  // No aggregateRating: the page shows no reviews to back one, and a
  // self-declared rating risks a spammy-markup manual action.
});

// Built from the FAQ the page actually renders — structured data that answers
// questions the visitor can't see on the page is a rich-result violation.
const faqSchema = (lang) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: nsT(lang, "home")("faq.items", { returnObjects: true }).map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "home");
  return buildMeta({
    lang,
    path: "",
    title: t("meta.title"),
    description: t("meta.description"),
    jsonLd: [
      softwareSchema(t),
      faqSchema(lang),
      webPageSchema({
        lang,
        path: "",
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
      }),
    ],
  });
});

export default function HomeRoute() {
  return (
    <>
      <ScrollToHash />
      <Home />
    </>
  );
}
