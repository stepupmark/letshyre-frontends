import type { RouteObject } from "react-router";
import { privateLoader } from "./PrivateRoute";
import { publicLoader } from "./PublicRoute";

import AppLayout from "../layout/AppLayout";

import SignIn from "../pages/AuthPages/SignIn";

import Dashboard from "../pages/admin/Dashboard";
import Candidates from "../pages/admin/Candidates";
import CandidateProfile from "../pages/admin/CandidateProfile";
import Employers from "../pages/admin/Employers";
import EmployerProfile from "../pages/admin/EmployerProfile";
import KycPendingEmployers from "../pages/admin/KycPendingEmployers";
import KycDetail from "../pages/admin/KycDetail";

import JobManagement from "../pages/admin/JobManagement";
import AiInterview from "../pages/admin/AiInterview";
import MatchingSystem from "../pages/admin/MatchingSystem";
import PaymentGateways from "../pages/admin/PaymentGateways";
import PaymentHistory from "../pages/admin/PaymentHistory";
import CreditSetup from "../pages/admin/Credit";

import ForgotPassword from "../pages/AuthPages/ForgotPassword";
import AddPaymentGateway from "../pages/admin/AddPaymentGateway";
import JobDetail from "../pages/admin/JobDetail";
import CouponManagement from "../pages/admin/CouponManagement";
import CreateCoupon from "../pages/admin/CreateCoupon";
import Unlocks from "../pages/admin/Unlocks";
import Channels from "../pages/admin/Channels";
import SystemConfigs from "../pages/admin/SystemConfigs";
import Logs from "../pages/admin/Logs";
import NotificationScheduler from "../pages/admin/Notification";
import NotFound from "../pages/NotFound";

export const routeDefinitions: RouteObject[] = [
  // ── Public routes (redirect to /dashboard if already authenticated)
  {
    path: "/",
    loader: publicLoader,
    Component: SignIn,
  },
  {
    path: "/forgot-password",
    loader: publicLoader,
    Component: ForgotPassword,
  },

  // ── Private routes (redirect to / if not authenticated)
  {
    path: "/dashboard",
    loader: privateLoader,
    Component: AppLayout, // renders <Outlet /> for all children below
    children: [
      // Default dashboard Candidates
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },

      { path: "system-config", Component: SystemConfigs },
      { path: "system-config/channels", Component: Channels },
      { path: "system-config/logs", Component: Logs },

      { path: "candidates", Component: Candidates },
      { path: "candidates/view-profile/:id", Component: CandidateProfile },
      { path: "employers", Component: Employers },
      { path: "employers/view-profile/:id", Component: EmployerProfile },

      // KYC
      { path: "kyc/pending-employers", Component: KycPendingEmployers },
      { path: "kyc/:id", Component: KycDetail },

      { path: "unlocks", Component: Unlocks },

      // Operations
      { path: "job-management", Component: JobManagement },
      { path: "jobs/:id", Component: JobDetail },
      { path: "ai-interview", Component: AiInterview },
      { path: "matching", Component: MatchingSystem },
      { path: "payment-gateways", Component: PaymentGateways },
      { path: "add-payment-gateway", Component: AddPaymentGateway },
      { path: "payments-history", Component: PaymentHistory },

      { path: "credits-management", Component: CreditSetup },

      { path: "notification-scheduler", Component: NotificationScheduler },

      { path: "coupon-management", Component: CouponManagement },
      { path: "create-coupon", Component: CreateCoupon },
    ],
  },

  {
    path: "*",
    Component: NotFound,
  },
];
