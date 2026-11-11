import font from "@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2?url"
import type { LinkDescriptor } from "react-router"

export const readingFontPreload: LinkDescriptor = {
  rel: "preload",
  href: font,
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
}
