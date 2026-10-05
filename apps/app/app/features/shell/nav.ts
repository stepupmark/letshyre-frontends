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
  /** also active on these path prefixes */
  match?: string[]
}

export interface NavGroup {
  key: "hiring" | "company" | "you" | "help"
  items: NavItem[]
}

// URLs match the legacy app so old links and bookmarks keep working
export const NAV = {
  employer: [
    {
      key: "hiring",
      items: [
        {
          key: "dashboard",
          to: "/employer",
          icon: LayoutDashboard,
          match: ["/employer/dashboard"],
        },
        { key: "postJob", to: "/employer/post-job", icon: FilePlus2 },
        { key: "jobs", to: "/employer/view-jobs", icon: BriefcaseBusiness },
        { key: "candidatePool", to: "/employer/candidate-pool", icon: Users },
        {
          key: "unlocked",
          to: "/employer/unlocked-candidates",
          icon: UserRoundCheck,
        },
      ],
    },
    {
      key: "company",
      items: [
        { key: "team", to: "/employer/your-team", icon: UsersRound },
        { key: "sharedLinks", to: "/employer/shared-links", icon: Link2 },
        {
          key: "billing",
          to: "/employer/invoice",
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
          to: "/employer/chatbot",
          icon: MessageCircleQuestion,
        },
      ],
    },
  ],
  candidate: [
    {
      key: "you",
      items: [
        {
          key: "findJobs",
          to: "/employee",
          icon: Search,
          match: ["/employee/find-jobs"],
        },
        {
          key: "applications",
          to: "/employee/my-applications",
          icon: ClipboardList,
        },
        {
          key: "scorecards",
          to: "/employee/score-cards-list",
          icon: Trophy,
          match: ["/employee/scorecard"],
        },
        { key: "profile", to: "/employee/profile", icon: SquareUser },
      ],
    },
    {
      key: "help",
      items: [
        {
          key: "interviewGuide",
          to: "/employee/interview-guide",
          icon: BookOpen,
        },
        {
          key: "assistant",
          to: "/employee/chatbot",
          icon: MessageCircleQuestion,
        },
      ],
    },
  ],
} satisfies Record<string, NavGroup[]>

export type Area = keyof typeof NAV

export const isActive = (item: NavItem, pathname: string) =>
  pathname === item.to ||
  (item.to !== "/employer" &&
    item.to !== "/employee" &&
    pathname.startsWith(`${item.to}/`)) ||
  (item.match ?? []).some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
