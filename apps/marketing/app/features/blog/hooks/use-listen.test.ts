import { act, renderHook } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"

import { POST_BODY_ID } from "../lib/post-body"
import { useListen } from "./use-listen"

class Utterance {
  voice: SpeechSynthesisVoice | null = null
  lang = ""
  rate = 1
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  text: string
  constructor(text: string) {
    this.text = text
  }
}

let spoken: Utterance[] = []

beforeEach(() => {
  spoken = []
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance)
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [{ lang: "en-IN", default: true, voiceURI: "en-IN" }],
    speak: (u: Utterance) => spoken.push(u),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
  document.body.innerHTML = `<article id="${POST_BODY_ID}"><p>One.</p><p>Two.</p></article>`
})

const start = () => {
  const view = renderHook(() => useListen("en", "Title"))
  act(() => {
    view.result.current.play()
  })
  return view
}

it("reads block after block and goes idle after the last", () => {
  const { result } = start()
  for (const _ of ["Title", "One.", "Two."]) act(() => spoken.at(-1)?.onend?.())

  expect(spoken.map((u) => u.text)).toEqual(["Title", "One.", "Two."])
  expect(result.current.status).toBe("idle")
})

it("resumes the paused block, and ignores what the cancelled utterance reports", () => {
  const { result } = start()
  act(() => spoken.at(-1)?.onend?.())
  const paused = spoken.at(-1)
  act(() => {
    result.current.pause()
  })
  // Chrome ends a cancelled utterance too; that mustn't move on or reset
  act(() => paused?.onend?.())
  act(() => paused?.onerror?.())
  expect(result.current.status).toBe("paused")
  expect(spoken).toHaveLength(2)

  act(() => {
    result.current.resume()
  })
  expect(spoken.at(-1)?.text).toBe("One.")
  expect(result.current.status).toBe("playing")
})

it("stops on a real speech error instead of staying on pause", () => {
  const { result } = start()
  act(() => spoken.at(-1)?.onerror?.())
  expect(result.current.status).toBe("idle")
})
