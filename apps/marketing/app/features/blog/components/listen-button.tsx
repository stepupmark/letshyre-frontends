import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { PauseIcon, PlayIcon, SquareIcon, Volume2Icon } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import { POST_BODY_ID } from "../lib/post-body"

// what the browser can read aloud in this language; voices arrive late in Chrome
const subscribeVoices = (onChange: () => void) => {
  if (!("speechSynthesis" in window)) return () => undefined
  speechSynthesis.addEventListener("voiceschanged", onChange)
  return () => {
    speechSynthesis.removeEventListener("voiceschanged", onChange)
  }
}

const voiceFor = (lang: string) =>
  "speechSynthesis" in window
    ? speechSynthesis
        .getVoices()
        .find((voice) => voice.lang.toLowerCase().startsWith(lang))
    : undefined

const voiceUriFor = (lang: string) => voiceFor(lang)?.voiceURI

// asides, navigation and tools aren't part of what the post says
const SKIP = ["[aria-hidden]", "aside", "nav", "[data-no-listen]"]

/** The post's text, a block at a time; one long utterance gets cut off after a while in Chrome. */
function blocksOf(root: HTMLElement): string[] {
  return [...root.querySelectorAll("h2, h3, p, li, blockquote, figcaption")]
    .filter(
      (el) =>
        !SKIP.some((selector) => el.closest(selector)) &&
        !el.parentElement?.closest("li, blockquote")
    )
    .map((el) => el.textContent.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

type State = "idle" | "playing" | "paused"

export default function ListenButton({ lang }: { lang: string }) {
  const { t } = useTranslation("blog")
  const voiceUri = useSyncExternalStore(
    subscribeVoices,
    () => voiceUriFor(lang),
    () => undefined
  )
  const [state, setState] = useState<State>("idle")

  // leaving the page mid-sentence shouldn't keep it talking
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel()
    },
    []
  )

  if (!voiceUri) return null

  const play = () => {
    const root = document.getElementById(POST_BODY_ID)
    const voice = voiceFor(lang)
    if (!root || !voice) return
    speechSynthesis.cancel()
    const blocks = blocksOf(root)
    blocks.forEach((text, i) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      utterance.lang = voice.lang
      if (i === blocks.length - 1)
        utterance.onend = () => {
          setState("idle")
        }
      speechSynthesis.speak(utterance)
    })
    setState("playing")
  }

  return (
    <div className="flex items-center gap-2">
      {state === "playing" ? (
        <Button
          variant="outline"
          onClick={() => {
            speechSynthesis.pause()
            setState("paused")
          }}
        >
          <PauseIcon aria-hidden />
          {t("post.pause")}
        </Button>
      ) : state === "paused" ? (
        <Button
          variant="outline"
          onClick={() => {
            speechSynthesis.resume()
            setState("playing")
          }}
        >
          <PlayIcon aria-hidden />
          {t("post.keepListening")}
        </Button>
      ) : (
        <Button variant="outline" onClick={play}>
          <Volume2Icon aria-hidden />
          {t("post.listen")}
        </Button>
      )}
      {state !== "idle" && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("post.stopListening")}
          onClick={() => {
            speechSynthesis.cancel()
            setState("idle")
          }}
        >
          <SquareIcon aria-hidden />
        </Button>
      )}
    </div>
  )
}
