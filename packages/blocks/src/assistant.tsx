import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowUp, RotateCw, Square, Trash2 } from "lucide-react"
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
} from "react"
import { Link } from "react-router"

import {
  ask,
  clear,
  snapshot,
  stop,
  subscribe,
  type AssistantMessage,
  type AssistantSend,
} from "./assistant-store"

export type { AssistantSend }

const Markdown = lazy(() => import("react-markdown"))

export interface AssistantLabels {
  log: string
  you: string
  assistant: string
  greeting: string
  hint: string
  input: string
  send: string
  stop: string
  thinking: string
  stopped: string
  failed: string
  retry: string
  clear: string
}

/**
 * One conversation per `key`, shared by every view of it and kept for the
 * tab. `send` gets an AbortSignal so Stop cancels the request.
 */
export function useAssistant(key: string, send: AssistantSend) {
  const state = useSyncExternalStore(
    useCallback((listener) => subscribe(key, listener), [key]),
    () => snapshot(key)
  )
  return {
    ...state,
    ask: (text: string) => void ask(key, send, text),
    retry: (message: AssistantMessage) =>
      void ask(key, send, message.text, message.id),
    stop: () => {
      stop(key)
    },
    clear: () => {
      clear(key)
    },
  }
}

export type Assistant = ReturnType<typeof useAssistant>

export function AssistantChat({
  chat,
  labels,
  prompts,
  focusOnOpen = false,
  className,
}: {
  chat: Assistant
  labels: AssistantLabels
  /** Suggested questions, shown until the first message. */
  prompts: string[]
  focusOnOpen?: boolean
  className?: string
}) {
  const [draft, setDraft] = useState("")
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { messages, pending } = chat
  const lastUser = messages.findLast((m) => m.role === "user")

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages.length, pending])

  const submit = (text: string) => {
    const message = text.trim()
    if (!message || pending) return
    chat.ask(message)
    setDraft("")
    inputRef.current?.focus()
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={logRef}
        role="log"
        aria-label={labels.log}
        aria-busy={pending}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="mt-auto flex flex-col gap-3">
            <p className="font-medium">{labels.greeting}</p>
            <p className="text-sm text-muted-foreground">{labels.hint}</p>
            <ul className="flex flex-col items-start gap-2">
              {prompts.map((prompt) => (
                <li key={prompt}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-1.5 text-start whitespace-normal"
                    onClick={() => {
                      submit(prompt)
                    }}
                  >
                    {prompt}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              labels={labels}
              onRetry={
                message === lastUser && message.problem && !pending
                  ? () => {
                      chat.retry(message)
                    }
                  : undefined
              }
            />
          ))
        )}
        {pending && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span aria-hidden="true" className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
            {labels.thinking}
          </p>
        )}
      </div>

      <form
        className="flex flex-col gap-2 border-t p-3"
        onSubmit={(event) => {
          event.preventDefault()
          submit(draft)
        }}
      >
        <div className="flex items-end gap-2 rounded-lg border bg-background p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- opening the assistant means typing next
            autoFocus={focusOnOpen}
            onChange={(event) => {
              setDraft(event.target.value)
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                submit(draft)
              }
            }}
            aria-label={labels.input}
            placeholder={labels.input}
            className="field-sizing-content max-h-40 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          {pending ? (
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              aria-label={labels.stop}
              onClick={chat.stop}
            >
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon-sm"
              aria-label={labels.send}
              disabled={!draft.trim()}
            >
              <ArrowUp />
            </Button>
          )}
        </div>
        {messages.length > 0 && !pending && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="self-start text-muted-foreground"
            onClick={chat.clear}
          >
            <Trash2 />
            {labels.clear}
          </Button>
        )}
      </form>
    </div>
  )
}

function Message({
  message,
  labels,
  onRetry,
}: {
  message: AssistantMessage
  labels: AssistantLabels
  onRetry?: () => void
}) {
  if (message.role === "user")
    return (
      <div className="flex animate-in flex-col items-end gap-1 duration-200 fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
        <p className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-primary-foreground">
          <span className="sr-only">{labels.you}: </span>
          {message.text}
        </p>
        {message.problem && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {message.problem === "stopped" ? labels.stopped : labels.failed}
            {onRetry && (
              <Button variant="ghost" size="xs" onClick={onRetry}>
                <RotateCw />
                {labels.retry}
              </Button>
            )}
          </p>
        )}
      </div>
    )

  return (
    <div className="max-w-[85%] animate-in self-start rounded-lg border bg-card px-3 py-2 text-sm duration-300 fade-in slide-in-from-bottom-1 motion-reduce:animate-none [&_li+li]:mt-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_p+p]:mt-2 [&_p+ul]:mt-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ps-5">
      <span className="sr-only">{labels.assistant}: </span>
      <Suspense
        fallback={<p className="whitespace-pre-wrap">{message.text}</p>}
      >
        <Markdown components={{ a: MarkdownLink }}>{message.text}</Markdown>
      </Suspense>
    </div>
  )
}

/** App paths stay in the app; anything else opens in a new tab. */
function MarkdownLink({ href = "", children }: ComponentProps<"a">) {
  if (href.startsWith("/") && !href.startsWith("//"))
    return (
      <Link to={href} className="font-medium underline underline-offset-4">
        {children}
      </Link>
    )
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-medium underline underline-offset-4"
    >
      {children}
    </a>
  )
}
