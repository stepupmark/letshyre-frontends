import { pagePolicy as policy } from "../../../tooling/csp.ts"

const META = ["https://www.facebook.com", "https://connect.facebook.net"]

export const pagePolicy = (html: string, apiOrigin: string) =>
  policy(html, {
    script: ["https://connect.facebook.net"],
    img: ["https://www.facebook.com"],
    connect: [apiOrigin, ...META],
  })
