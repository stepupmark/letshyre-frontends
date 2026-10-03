import { buildMeta, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { nsT, seoT } from "@/i18n/i18n";
import { localeMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["interview"] };
export const loader = () => null;
export const clientLoader = catalogLoader(handle.i18n);

export { HowItWorks as default } from "@/features/how-it-works/HowItWorks";

// Same order the page renders them in; the schema reads the visible copy so
// the two can't drift and every locale gets its own steps.
const STEP_KEYS = [
  "download", "signIn", "dashboard", "clearEnv",
  "permissions", "verifyId", "chooseRole", "begin",
];

const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const howToSchema = (lang, t) => {
  const step = nsT(lang, "interview");
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
    step: STEP_KEYS.map((key, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step(`steps.${key}.title`),
      text: plain(step(`steps.${key}.desc`)),
    })),
  };
};

export const meta = localeMeta((lang) => {
  const t = nsT(lang, "interview");
  return buildMeta({
    lang,
    path: "/how-it-works-interview",
    title: t("meta.title"),
    description: t("meta.description"),
    type: "article",
    jsonLd: [
      howToSchema(lang, t),
      webPageSchema({
        lang,
        path: "/how-it-works-interview",
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
      }),
      breadcrumbSchema(lang, seoT(lang)("homeCrumb"), [
        { name: t("meta.crumb"), path: "/how-it-works-interview" },
      ]),
    ],
  });
});
