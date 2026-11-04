import { href } from "react-router"

/** Where invite links lead; stands in for the server's link when its preview is unavailable. */
export const sampleInviteLink = () =>
  new URL(href("/employee/register"), window.location.origin).toString()
