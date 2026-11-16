import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { z } from "zod"

import { listenBlocks, type ListenBlock, pickVoice } from "../lib/listen-text"
import { localStore } from "../lib/local-store"
import { POST_BODY_ID } from "../lib/post-body"

const RATES = [1, 1.25, 1.5, 2, 0.75] as const
type Rate = (typeof RATES)[number]
const rateStore = localStore<Rate>("listen-rate", z.literal(RATES), 1)

type Status = "idle" | "playing" | "paused"

const supported = () => "speechSynthesis" in window

// voices arrive late in Chrome
const subscribeVoices = (onChange: () => void) => {
  if (!supported()) return () => undefined
  speechSynthesis.addEventListener("voiceschanged", onChange)
  return () => {
    speechSynthesis.removeEventListener("voiceschanged", onChange)
  }
}

const voiceFor = (lang: string) =>
  supported()
    ? pickVoice(speechSynthesis.getVoices(), lang, navigator.languages)
    : undefined

function follow(from: HTMLElement | null, to: HTMLElement) {
  if (!from || from === to) return
  const was = from.getBoundingClientRect()
  const next = to.getBoundingClientRect()
  const inView = (r: DOMRect) => r.bottom > 0 && r.top < window.innerHeight
  // a reader who has scrolled away is left where they are
  if (!inView(was) || inView(next)) return
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  to.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" })
}

/**
 * Reads the post one block at a time. Pausing cancels and remembers the block, because
 * `speechSynthesis.pause()` does nothing on Android.
 */
export function useListen(lang: string, title: string) {
  const voiceUri = useSyncExternalStore(
    subscribeVoices,
    () => voiceFor(lang)?.voiceURI,
    () => undefined
  )
  const rate = rateStore.useValue() ?? 1
  const [status, setStatus] = useState<Status>("idle")
  const [blocks, setBlocks] = useState<readonly ListenBlock[]>([])
  const [index, setIndex] = useState(0)
  // Chrome fires onend and onerror for utterances it cancelled; only the latest may act
  const generation = useRef(0)
  const shown = useRef<HTMLElement | null>(null)

  const halt = () => {
    generation.current += 1
    if (supported()) speechSynthesis.cancel()
  }

  const stop = () => {
    halt()
    setStatus("idle")
    setIndex(0)
  }

  const speakAt = (list: readonly ListenBlock[], i: number) => {
    halt()
    const block = list[i]
    const voice = voiceFor(lang)
    if (!block || !voice) {
      setStatus("idle")
      setIndex(0)
      return
    }
    const gen = generation.current
    const utterance = new SpeechSynthesisUtterance(block.text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.rate = rateStore.read()
    utterance.onend = () => {
      if (gen === generation.current) speakAt(list, i + 1)
    }
    utterance.onerror = () => {
      if (gen !== generation.current) return
      generation.current += 1
      setStatus("idle")
      setIndex(0)
    }
    speechSynthesis.speak(utterance)
    setIndex(i)
    setStatus("playing")
  }

  // Chrome can keep talking across a reload, and leaving the post should silence it
  useEffect(() => {
    const silence = () => {
      generation.current += 1
      if (supported()) speechSynthesis.cancel()
    }
    window.addEventListener("pagehide", silence)
    return () => {
      window.removeEventListener("pagehide", silence)
      silence()
    }
  }, [])

  useEffect(() => {
    const el = status === "idle" ? null : (blocks[index]?.el ?? null)
    if (!el) return
    follow(shown.current, el)
    shown.current = el
    el.setAttribute("data-listening", "")
    return () => {
      el.removeAttribute("data-listening")
    }
  }, [status, index, blocks])

  return {
    available: voiceUri !== undefined,
    status,
    blocks,
    index,
    rate,
    play: () => {
      const root = document.getElementById(POST_BODY_ID)
      if (!root) return
      const list = listenBlocks(root, title, lang)
      setBlocks(list)
      shown.current = null
      speakAt(list, 0)
    },
    pause: () => {
      halt()
      setStatus("paused")
    },
    resume: () => {
      speakAt(blocks, index)
    },
    previous: () => {
      speakAt(blocks, Math.max(0, index - 1))
    },
    next: () => {
      speakAt(blocks, Math.min(blocks.length - 1, index + 1))
    },
    cycleRate: () => {
      rateStore.write(RATES[(RATES.indexOf(rate) + 1) % RATES.length] ?? 1)
      if (status === "playing") speakAt(blocks, index)
    },
    stop,
  }
}

export type Listen = ReturnType<typeof useListen>
