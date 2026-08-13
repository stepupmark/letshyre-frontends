/**
 * sidebarConfig.tsx
 *
 * Single source of truth for the sidebar navigation tree.
 * Kept separate from routeConfig to avoid a circular import:
 *   routeConfig → AppLayout → AppSidebar → sidebarConfig  ✓
 *   routeConfig → AppLayout → AppSidebar → routeConfig    ✗ (circular)
 */

import type { ComponentType, SVGProps } from "react";

import {
  CreditCard,
  Coins,
  Tag,
  History,
  Rows3,
  BarChart3,
  Users,
  Unlock,
  Settings,
} from "lucide-react";

// Custom inline SVG icon for KYC Verification
const KycCheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarSubItem = {
  name: string;
  path: string;
};

export type SidebarNavItem = {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  path?: string; // present for leaf links
  subItems?: SidebarSubItem[]; // present for expandable groups
};

// ─── Config ───────────────────────────────────────────────────────────────────

export const sidebarMenuConfig: SidebarNavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard/",
    icon: BarChart3,
  },
  {
    name: "System Configuration",
    icon: Settings,
    subItems: [
      {
        name: "Configs",
        path: "/dashboard/system-config",
      },
      { name: "Channels", path: "/dashboard/system-config/channels" },
      { name: "Logs", path: "/dashboard/system-config/logs" },
    ],
  },
  {
    name: "Candidates",
    path: "/dashboard/candidates",
    icon: Users,
    // icon: UserCircleIcon,
  },
  {
    name: "Employers",
    path: "/dashboard/employers",
    icon: Users,
  },
  {
    name: "KYC Verification",
    path: "/dashboard/kyc/pending-employers",
    icon: KycCheckIcon,
  },
  {
    name: "Unlocks",
    path: "/dashboard/unlocks",
    icon: Unlock,
  },
  {
    name: "Job Management",
    path: "/dashboard/job-management",
    icon: Rows3,
  },
  // {
  //   name: "AI Interview Management",
  //   path: "/dashboard/ai-interview",
  //   icon: AudioIcon,
  // },
  // {
  //   name: "Matching System",
  //   path: "/dashboard/matching",
  //   icon: GridIcon,
  // },
  // {
  //   name: "Payment Gateways",
  //   path: "/dashboard/payments",
  //   icon: DollarLineIcon,
  // },

  {
    name: "Payment Gateways",
    path: "/dashboard/payment-gateways",
    icon: CreditCard,
  },
  {
    name: "Payments History",
    path: "/dashboard/payments-history",
    icon: History,
  },

  {
    name: "Credits Management",
    path: "/dashboard/credits-management",
    icon: Coins,
  },

  {
    name: "Coupon Management",
    path: "/dashboard/coupon-management",
    icon: Tag,
  },
];
