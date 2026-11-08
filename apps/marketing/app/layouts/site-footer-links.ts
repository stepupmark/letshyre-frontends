import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

export const FOOTER_COLUMNS = [
  {
    id: "product",
    title: "footer.product",
    links: [
      { label: "footer.links.pricing", path: "/pricing" },
      {
        label: "footer.links.employerGuide",
        path: PAGES.employerGuide.path,
        page: "employerGuide",
      },
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
        label: "footer.links.interviewGuide",
        path: PAGES.interview.path,
        page: "interview",
      },
      {
        label: "footer.links.candidateGuide",
        path: PAGES.candidateGuide.path,
        page: "candidateGuide",
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
      { label: "footer.links.blog", path: PAGES.blog.path, page: "blog" },
      { label: "footer.links.contact", path: "/contact" },
    ],
  },
  {
    id: "legal",
    title: "footer.legal",
    links: [
      { label: "footer.links.terms", path: "/terms" },
      { label: "footer.links.privacy", path: "/privacy-policy" },
      { label: "footer.links.refund", path: "/refund-policy" },
    ],
  },
] as const
