import { env } from "./env"

const app = (path: string) => new URL(path, env.VITE_APP_URL).href

/** Every link into the dashboard app (docs/baseline/url-contract.md §3). */
export const APP_LINKS = {
  logIn: app("/get-started"),
  getStarted: app("/get-started"),
  employerRegister: app("/employer/register"),
  candidateRegister: app("/employee/register"),
  candidateSignIn: app("/employee/sign-in"),
  checkout: (key: string) =>
    app(`/employer/billing?checkout=${encodeURIComponent(key)}`),
} as const
