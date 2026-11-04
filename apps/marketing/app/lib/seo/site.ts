import { env } from "../env"

export const SITE = {
  url: env.VITE_SITE_URL.replace(/\/$/, ""),
  name: "LetsHyre",
  // page titles end with the domain, so search engines should know both names
  domain: "letshyre.ai",
  twitter: "@letshyreAi",
  email: "support@letshyre.ai",
  sameAs: [
    "https://www.linkedin.com/company/letshyre/",
    "https://x.com/letshyreAi",
    "https://www.instagram.com/letshyreofficial/",
    "https://www.youtube.com/@LetsHyre",
  ],
} as const

export const absUrl = (path = "/") =>
  `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`
