import { href } from "react-router"

import { env } from "@/lib/env"

/** Where invite links lead; stands in for the server's link when its preview is unavailable. */
export const sampleInviteLink = () =>
  new URL(href("/employee/register"), env.VITE_APP_URL).toString()
