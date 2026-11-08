import { pagePolicy as policy } from "../../../tooling/csp.ts"

const META = ["https://www.facebook.com", "https://connect.facebook.net"]
const YOUTUBE = "https://www.youtube-nocookie.com"

export const pagePolicy = (html: string, apiOrigin: string) =>
  policy(html, {
    script: ["https://connect.facebook.net"],
    img: ["https://www.facebook.com"],
    connect: [apiOrigin, ...META],
    // only posts with a <VideoEmbed> may frame the player
    ...(html.includes("data-video-embed") && { frame: [YOUTUBE] }),
  })
