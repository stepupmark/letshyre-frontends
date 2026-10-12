import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  FilePlus2,
  LayoutDashboard,
  Link2,
  MessageCircleQuestion,
  Search,
  SquareUser,
  Trophy,
  UserRoundCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { href, matchPath } from "react-router"

import type { RoutePattern } from "@/lib/app-paths"

export interface NavItem {
  key:
    | "dashboard"
    | "postJob"
    | "jobs"
    | "candidatePool"
    | "unlocked"
    | "team"
    | "sharedLinks"
    | "billing"
    | "findJobs"
    | "applications"
    | "scorecards"
    | "profile"
    | "interviewGuide"
    | "assistant"
  to: string
  icon: LucideIcon
  /** route patterns it is also active under */
  match?: RoutePattern[]
}

export interface NavGroup {
  key: "hiring" | "company" | "you" | "help"
  items: NavItem[]
}

export const NAV = {
  employer: [
    {
      key: "hiring",
      items: [
        {
          key: "dashboard",
          to: href("/employer/dashboard"),
          icon: LayoutDashboard,
        },
        { key: "postJob", to: href("/employer/jobs/new"), icon: FilePlus2 },
        { key: "jobs", to: href("/employer/jobs"), icon: BriefcaseBusiness },
        { key: "candidatePool", to: href("/employer/candidates"), icon: Users },
        {
          key: "unlocked",
          to: href("/employer/candidates/unlocked"),
          icon: UserRoundCheck,
          match: ["/employer/candidates/:candidateId"],
        },
      ],
    },
    {
      key: "company",
      items: [
        { key: "team", to: href("/employer/team"), icon: UsersRound },
        {
          key: "sharedLinks",
          to: href("/employer/shared-links"),
          icon: Link2,
        },
        {
          key: "billing",
          to: href("/employer/invoices"),
          icon: CreditCard,
          match: ["/employer/billing"],
        },
      ],
    },
    {
      key: "help",
      items: [
        {
          key: "assistant",
          to: href("/employer/assistant"),
          icon: MessageCircleQuestion,
        },
      ],
    },
  ],
  candidate: [
    {
      key: "you",
      items: [
        { key: "findJobs", to: href("/employee/jobs"), icon: Search },
        {
          key: "applications",
          to: href("/employee/applications"),
          icon: ClipboardList,
        },
        { key: "scorecards", to: href("/employee/scorecards"), icon: Trophy },
        { key: "profile", to: href("/employee/profile"), icon: SquareUser },
      ],
    },
    {
      key: "help",
      items: [
        {
          key: "interviewGuide",
          to: href("/employee/interview-guide"),
          icon: BookOpen,
        },
        {
          key: "assistant",
          to: href("/employee/assistant"),
          icon: MessageCircleQuestion,
        },
      ],
    },
  ],
} satisfies Record<string, NavGroup[]>

export type Area = keyof typeof NAV

const ITEMS = Object.values(NAV).flatMap((groups: NavGroup[]) =>
  groups.flatMap((group) => group.items)
)

const depth = (item: NavItem, pathname: string) =>
  Math.max(
    0,
    ...[item.to, ...(item.match ?? [])]
      .filter((path) => matchPath({ path, end: false }, pathname))
      .map((path) => path.length)
  )

/** Active when no other item matches the pathname more specifically. */
export const isActive = (item: NavItem, pathname: string) => {
  const own = depth(item, pathname)
  return own > 0 && ITEMS.every((other) => depth(other, pathname) <= own)
}
