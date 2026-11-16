import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

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
  vi.useFakeTimers()
  spoken = []
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance)
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [
      { lang: "en-IN", name: "Test", default: true, voiceURI: "en-IN" },
    ],
    speak: (u: Utterance) => spoken.push(u),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
  document.body.innerHTML = `<article id="${POST_BODY_ID}"><p>One.</p><p>Two.</p></article>`
})

afterEach(() => {
  vi.useRealTimers()
})

// ends the utterance being spoken, and the pause after it
const end = () => {
  act(() => {
    spoken.at(-1)?.onend?.()
    vi.runAllTimers()
  })
}

const start = () => {
  const view = renderHook(() => useListen("en", "Title"))
  act(() => {
    view.result.current.play()
  })
  return view
}

it("reads block after block and goes idle after the last", () => {
  const { result } = start()
  end()
  end()
  end()

  expect(spoken.map((u) => u.text)).toEqual(["Title", "One.", "Two."])
  expect(result.current.status).toBe("idle")
})

it("resumes the paused block, and ignores what the cancelled utterance reports", () => {
  const { result } = start()
  end()
  // paused in the beat between two blocks, the next one mustn't start
  act(() => {
    spoken.at(-1)?.onend?.()
    result.current.pause()
    vi.runAllTimers()
  })
  expect(spoken).toHaveLength(2)
  act(() => {
    result.current.resume()
  })
  const paused = spoken.at(-1)
  act(() => {
    result.current.pause()
  })
  // Chrome ends a cancelled utterance too; that mustn't move on or reset
  act(() => paused?.onend?.())
  act(() => paused?.onerror?.())
  expect(result.current.status).toBe("paused")
  expect(spoken).toHaveLength(3)

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
