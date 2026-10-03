import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { SendIcon } from "lucide-react"
import { lazy, Suspense, use, useEffect, useRef, useState } from "react"

import { loadAssistantCopy } from "../lib/copy"
import { writeSessionId } from "../lib/session"
import { useSendAssistantMessage } from "../mutations/use-send-assistant-message"

const Markdown = lazy(() => import("react-markdown"))

interface Message {
  id: number
  role: "user" | "assistant"
  text: string
}

const PROMPTS = ["what", "scorecard", "applications", "interview"] as const

export function AssistantPanel() {
  use(loadAssistantCopy(useLocale()))
  const { t } = useTranslation("assistant")
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const nextId = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)
  const send = useSendAssistantMessage()

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, send.isPending])

  function submit(message: string) {
    send.mutate(message, {
      onSuccess: ({ response }) => {
        setMessages((m) => [
          ...m,
          { id: nextId.current++, role: "assistant", text: response },
        ])
      },
    })
  }

  function ask(text: string) {
    const message = text.trim()
    if (!message || send.isPending) return
    setMessages((m) => [
      ...m,
      { id: nextId.current++, role: "user", text: message },
    ])
    setDraft("")
    submit(message)
  }

  function retry() {
    const last = messages.findLast((m) => m.role === "user")
    if (last) submit(last.text)
  }

  function clear() {
    setMessages([])
    send.reset()
    writeSessionId(undefined)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={t("chatbot.messagesLabel")}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-2"
      >
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="font-medium">{t("chatbot.empty.greeting")}</p>
            <p className="text-muted-foreground">{t("chatbot.empty.hint")}</p>
            <div className="flex flex-wrap gap-2">
              {PROMPTS.map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    ask(t(`chatbot.empty.prompts.${key}`))
                  }}
                >
                  {t(`chatbot.empty.prompts.${key}`)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) =>
          message.role === "user" ? (
            <div
              key={message.id}
              className="max-w-[85%] self-end rounded-lg bg-primary px-3 py-2 text-primary-foreground"
            >
              <span className="sr-only">{t("chatbot.you")}: </span>
              {message.text}
            </div>
          ) : (
            <div
              key={message.id}
              className="max-w-[85%] self-start rounded-lg border px-3 py-2 [&_a]:underline [&_ol]:list-decimal [&_ol]:ps-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:ps-5"
            >
              <span className="sr-only">{t("chatbot.assistant")}: </span>
              <Suspense fallback={message.text}>
                <Markdown>{message.text}</Markdown>
              </Suspense>
            </div>
          )
        )}

        {send.isPending && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Spinner />
            {t("chatbot.thinking")}
          </p>
        )}
        {send.isError && (
          <div className="flex items-center gap-3 text-destructive">
            <p>{t("chatbot.errorMessage")}</p>
            <Button variant="outline" size="sm" onClick={retry}>
              {t("chatbot.retry")}
            </Button>
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t p-4"
        onSubmit={(event) => {
          event.preventDefault()
          ask(draft)
        }}
      >
        {messages.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            {t("chatbot.clear")}
          </Button>
        )}
        <Input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          placeholder={t("chatbot.inputPlaceholder")}
          aria-label={t("chatbot.inputPlaceholder")}
          autoComplete="off"
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          aria-label={t("chatbot.sendAria")}
          disabled={!draft.trim() || send.isPending}
        >
          <SendIcon aria-hidden className="rtl:-scale-x-100" />
        </Button>
      </form>
    </div>
  )
}
