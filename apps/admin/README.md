# Letshyre Admin Frontend 🚀

A modern, high-performance admin dashboard built with React 18, Vite, and Tailwind CSS. This dashboard provides comprehensive management tools for the Letshyre platform, including candidate tracking, employer management, system configurations, and payment monitoring.

## ✨ Key Features

- **📊 Dynamic Dashboard**: Real-time analytics and data visualization using ApexCharts and Recharts.
- **🛠️ System Configuration**:
  - Centralized platform controls and resource limits.
  - Communication channel management (Email, SMS, Push).
  - Detailed audit logs for tracking system communications.
- **👥 User Management**:
  - Comprehensive Candidate and Employer management interfaces.
  - KYC verification workflow for business accounts.
- **💰 Financial Operations**:
  - Payment gateway configurations.
  - Detailed transaction history and credit management.
  - Coupon creation and lifecycle management.
- **💼 Job Management**: oversee platform job postings and matching systems.
- **🎨 Premium UI/UX**:
  - Responsive design with dark mode support.
  - Smooth micro-animations powered by Framer Motion.
  - Interactive tables with pagination and server-side filtering.

## 🛠️ Tech Stack

- **Core**: [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State Management**: [TanStack Query (v5)](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [ApexCharts](https://apexcharts.com/), [Recharts](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ShivajiVS/letshyre-admin-frontend.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_API_BASE_URL=https://api.letshyre.com/
   ```

### Development

Run the development server:

```bash
npm run dev
```

### Build

Build the project for production:

```bash
npm run build
```

The production-ready files will be located in the `dist/` directory.

## 📁 Project Structure

```text
src/
├── api/          # Axios instances and API services
├── components/   # Reusable UI components (common, logs, config, etc.)
├── hooks/        # Custom React hooks and Query hooks
├── pages/        # Main application pages
├── router/       # Routing and navigation configurations
├── types/        # TypeScript interfaces and types
├── lib/          # Utility functions and formatters
└── assets/       # Static assets and global styles
```

## 🏗️ Architecture & Patterns

### API Layer

- **Axios Instance**: A centralized `apiClient` handles all HTTP requests.
- **Interceptors**:
  - **Request**: Automatically attaches the `Authorization` bearer token from `localStorage`.
  - **Response**: Features a **Silent Refresh** mechanism. If a `401 Unauthorized` occurs, it automatically attempts to refresh the access token and retries the original request seamlessly.
- **Service Pattern**: API calls are organized into domain-specific service files (e.g., `logs.api.ts`, `auth.api.ts`).

### State Management

- **Server State**: Managed via **TanStack Query (v5)**.
  - `staleTime` is set to 5 minutes by default to reduce redundant network calls.
  - Queries are decoupled into custom hooks (e.g., `useLogs.ts`) for reusability.
- **UI State**: Managed via standard React `useState` and `useContext` for global concerns like Theme and Auth status.

### Authentication Flow

1. **Login**: User authenticates and receives an `access_token`.
2. **Persistence**: The token is stored in `localStorage`.
3. **Guard**: Protected routes are wrapped in an `AuthGuard` that checks for token validity before rendering.
4. **Auto-Refresh**: The Axios interceptor handles token expiration by calling the refresh endpoint without user intervention.

## 🎨 Theme & Styling

- **Tailwind CSS**: Utility-first styling with a custom configuration for the Letshyre design system.
- **Dark Mode**: Fully supported via a `ThemeProvider` and CSS variables. It detects system preferences and allows manual toggling.
- **Layouts**: Responsive grid and flexbox layouts ensure the dashboard remains functional across all device sizes.

## 📝 Form Handling

- **React Hook Form**: Used for high-performance, uncontrolled form components.
- **Zod**: Provides schema-based validation for all forms, ensuring type safety from the UI down to the API request body.

## 🔧 Development Best Practices

- **Type Safety**: Avoid using `any`. Define interfaces in `src/types/` for all API responses and component props.
- **Component Isolation**: Keep components small and focused. Large components should be broken down into sub-components.
- **Error Handling**: Use the `sonner` toast library for user-facing success/error feedback.
- **Performance**: Use `React.memo` or `useMemo` sparingly, only when profiling shows a clear benefit. Leverage TanStack Query's built-in caching.

## 🧪 Testing & Quality

- **Linting**: ESLint with a strict configuration ensures code consistency.
- **Formatting**: Vite-integrated formatting helps maintain a clean codebase.
- **Manual Verification**: Test all UI changes in both Light and Dark modes.

## 📜 License

This project is private and proprietary. All rights reserved.

---

Built with ❤️ by the Letshyre Team.
