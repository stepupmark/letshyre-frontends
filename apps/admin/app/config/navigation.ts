import {
  BadgeCheck,
  BarChart3,
  Building2,
  Coins,
  CreditCard,
  History,
  Rows3,
  Settings,
  Tag,
  Unlock,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  title: string;
  url: string;
};

export type NavItem = NavLink & {
  icon: LucideIcon;
  items?: NavLink[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: BarChart3 }],
  },
  {
    label: "People",
    items: [
      { title: "Candidates", url: "/dashboard/candidates", icon: Users },
      { title: "Employers", url: "/dashboard/employers", icon: Building2 },
      { title: "KYC Verification", url: "/dashboard/kyc", icon: BadgeCheck },
      { title: "Unlocks", url: "/dashboard/unlocks", icon: Unlock },
    ],
  },
  {
    label: "Operations",
    items: [{ title: "Job Management", url: "/dashboard/jobs", icon: Rows3 }],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Payment Gateways",
        url: "/dashboard/payment-gateways",
        icon: CreditCard,
      },
      { title: "Payments History", url: "/dashboard/payments", icon: History },
      { title: "Credits", url: "/dashboard/credits", icon: Coins },
      { title: "Coupons", url: "/dashboard/coupons", icon: Tag },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        items: [
          { title: "Configuration", url: "/dashboard/settings" },
          { title: "Channels", url: "/dashboard/settings/channels" },
          { title: "Logs", url: "/dashboard/settings/logs" },
        ],
      },
    ],
  },
];
