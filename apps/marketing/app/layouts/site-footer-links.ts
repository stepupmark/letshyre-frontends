import { APP_LINKS } from "@/lib/app-links"

export const FOOTER_COLUMNS = [
  {
    id: "product",
    title: "footer.product",
    links: [
      { label: "nav.howItWorks", path: "", hash: "how-it-works" },
      { label: "footer.links.pricing", path: "/pricing" },
      {
        label: "footer.links.employerRegister",
        href: APP_LINKS.employerRegister,
      },
    ],
  },
  {
    id: "candidates",
    title: "footer.candidates",
    links: [
      {
        label: "footer.links.interviewProcess",
        path: "/how-it-works-interview",
      },
      { label: "footer.links.downloadApp", path: "/download" },
      {
        label: "footer.links.candidateRegister",
        href: APP_LINKS.candidateRegister,
      },
    ],
  },
  {
    id: "company",
    title: "footer.company",
    links: [
      { label: "footer.links.about", path: "/about" },
      { label: "footer.links.contact", path: "/contact" },
    ],
  },
  {
    id: "legal",
    title: "footer.legal",
    links: [
      { label: "footer.links.terms", path: "/terms" },
      { label: "footer.links.privacy", path: "/policy" },
      { label: "footer.links.refund", path: "/refund-policy" },
    ],
  },
] as const

const NETWORKS = {
  "linkedin.com": "linkedin",
  "x.com": "x",
  "twitter.com": "x",
  "instagram.com": "instagram",
  "youtube.com": "youtube",
} as const

export type SocialNetwork = (typeof NETWORKS)[keyof typeof NETWORKS]

/** Which icon and label a profile URL gets. `null` for networks we don't have an icon for. */
export function socialNetwork(url: string): SocialNetwork | null {
  const host = new URL(url).hostname.replace(/^www\./, "")
  return host in NETWORKS ? NETWORKS[host as keyof typeof NETWORKS] : null
}
