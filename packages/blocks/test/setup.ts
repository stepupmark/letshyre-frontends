import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(cleanup)

// jsdom has no matchMedia; next-themes reads it
Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({
    matches: false,
    media: query,
    addListener: () => undefined,
    removeListener: () => undefined,
  }),
})

// jsdom has no layout; the assistant follows new messages with these
window.IntersectionObserver = class {
  observe = () => undefined
  disconnect = () => undefined
} as unknown as typeof IntersectionObserver
Element.prototype.scrollIntoView = () => undefined
