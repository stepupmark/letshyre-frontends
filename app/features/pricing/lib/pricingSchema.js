import { nsT } from "@/i18n/i18n";

const stripTags = (text) => text.replace(/<[^>]+>/g, "");

// Prices load in the browser, so the prerendered page has none to put in an
// Offer; the FAQ is the structured data it can vouch for.
export function pricingSchemas(lang) {
  const t = nsT(lang, "pricing");

  return [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t("faq.items", { returnObjects: true }).map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: stripTags(item.a) },
      })),
    },
  ];
}
