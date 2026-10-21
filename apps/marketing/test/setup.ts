import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

afterEach(cleanup)

// jsdom has neither; the assistant panel uses both to follow new answers
Element.prototype.scrollIntoView = vi.fn()

class NoIntersections {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = () => []
}
vi.stubGlobal("IntersectionObserver", NoIntersections)
