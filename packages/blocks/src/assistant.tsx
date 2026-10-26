import { safeUrl } from "@workspace/api"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  RotateCw,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react"
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
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

export type { AssistantMessage, AssistantSend }

const Markdown = lazy(() => import("react-markdown"))

export interface AssistantLabels {
  log: string
  you: string
  assistant: string
  input: string
  send: string
  stop: string
  thinking: string
  slow: string
  stopped: string
  failed: string
  retry: string
  clear: string
  copy: string
  copied: string
  latest: string
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
    /** Returns an undo. */
    clear: () => clear(key),
  }
}

export type Assistant = ReturnType<typeof useAssistant>

type Ask = (text: string) => void

export function AssistantChat({
  chat,
  labels,
  welcome,
  suggestions,
  next,
  onClear,
  tools,
  hint,
  placeholders,
  layout = "panel",
  focusOnOpen = false,
}: {
  chat: Assistant
  labels: AssistantLabels
  /** Shown until the first message; on a page it sits above the input. */
  welcome: (ask: Ask) => ReactNode
  /** On a page, shown under the input until the first message. */
  suggestions?: (ask: Ask) => ReactNode
  /** Shown under the latest answer. */
  next?: (ask: Ask, messages: AssistantMessage[]) => ReactNode
  /** Gets the undo after the inline Clear; a page brings its own through `tools`. */
  onClear?: (undo: () => void) => void
  /** At the start of the input once the conversation has begun. */
  tools?: ReactNode
  /** Under the input before the first message. */
  hint?: string
  /** Example questions the empty input cycles through. */
  placeholders?: string[]
  /** A panel scrolls inside itself; a page scrolls with the window. */
  layout?: "panel" | "page"
  focusOnOpen?: boolean
}) {
  const [draft, setDraft] = useState("")
  const [input, setInput] = useState<HTMLTextAreaElement | null>(null)
  const { messages, pending } = chat
  const last = messages.at(-1)
  const lastUser = messages.findLast((m) => m.role === "user")
  const { log, end, unseen, jump } = useFollow(last)
  const page = layout === "page"
  const empty = messages.length === 0
  const rotating = empty && !draft && placeholders && placeholders.length > 0

  useSlashToFocus(page ? input : null)

  const submit = (text: string) => {
    const message = text.trim()
    if (!message || pending) return
    if (page && empty)
      moveComposer(() => {
        chat.ask(message)
      })
    else chat.ask(message)
    setDraft("")
    input?.focus()
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        !page && "min-h-0",
        page && empty && "justify-center pb-16"
      )}
    >
      <div
        ref={log}
        role="log"
        aria-label={labels.log}
        aria-busy={pending}
        className={cn(
          "flex flex-col",
          page ? !empty && "flex-1" : "min-h-0 flex-1 overflow-y-auto p-4"
        )}
      >
        {empty
          ? welcome(submit)
          : messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                labels={labels}
                page={page}
                latest={message === last}
                onRetry={
                  message === lastUser && message.problem && !pending
                    ? () => {
                        chat.retry(message)
                      }
                    : undefined
                }
              />
            ))}
        {pending && <Thinking labels={labels} />}
        {last?.role === "assistant" && !pending && next?.(submit, messages)}
        <div
          ref={end}
          aria-hidden="true"
          className={page ? "scroll-mb-32" : undefined}
        />
      </div>
      <p role="status" className="sr-only">
        {pending ? labels.thinking : ""}
      </p>

      <form
        style={page ? { viewTransitionName: "assistant-composer" } : undefined}
        className={cn(
          "relative flex flex-col gap-2 bg-background",
          !page && "border-t p-3",
          page && (empty ? "mt-6" : "sticky bottom-0 mt-6 pt-2 pb-6"),
          page &&
            !empty &&
            "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-linear-to-t before:from-background"
        )}
        onSubmit={(event) => {
          event.preventDefault()
          submit(draft)
        }}
      >
        {unseen && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full z-10 flex justify-center pb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-auto animate-in rounded-full bg-background shadow-sm duration-200 fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
              onClick={jump}
            >
              <ArrowDown />
              {labels.latest}
            </Button>
          </div>
        )}
        <div
          className={cn(
            "flex items-end gap-2 border bg-background transition-[border-color,box-shadow] focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/15",
            page ? "rounded-2xl p-2 shadow-sm" : "rounded-xl p-1.5 shadow-xs"
          )}
        >
          {!empty && tools}
          <div className="relative flex min-w-0 flex-1">
            <textarea
              ref={setInput}
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
              placeholder={rotating ? undefined : labels.input}
              className={cn(
                "field-sizing-content max-h-40 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-base outline-none placeholder:text-muted-foreground",
                !page && "md:text-sm"
              )}
            />
            {rotating && <RotatingPlaceholder items={placeholders} />}
          </div>
          {pending ? (
            <Button
              key="stop"
              type="button"
              size={page ? "icon" : "icon-sm"}
              variant="secondary"
              aria-label={labels.stop}
              className="animate-in duration-150 zoom-in-75 fade-in motion-reduce:animate-none"
              onClick={chat.stop}
            >
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button
              key="send"
              type="submit"
              size={page ? "icon" : "icon-sm"}
              variant={draft.trim() ? "default" : "secondary"}
              aria-label={labels.send}
              disabled={!draft.trim()}
              className="animate-in duration-150 zoom-in-75 fade-in motion-reduce:animate-none"
            >
              <ArrowUp />
            </Button>
          )}
        </div>
        {page && empty && hint && (
          <p className="text-center text-xs text-muted-foreground">{hint}</p>
        )}
        {!page && !empty && !pending && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="self-start text-muted-foreground"
            onClick={() => {
              onClear?.(chat.clear())
            }}
          >
            <Trash2 />
            {labels.clear}
          </Button>
        )}
      </form>
      {page && empty && suggestions?.(submit)}
    </div>
  )
}

/** Runs a change that moves the page's input, gliding it there where supported. */
export function moveComposer(change: () => void) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduce || !("startViewTransition" in document)) {
    change()
    return
  }
  document.startViewTransition(async () => {
    change()
    // React commits the store update in a microtask; wait it out before the snapshot
    await new Promise((resolve) => setTimeout(resolve))
  })
}

// on a page, "/" jumps to the input from anywhere that isn't a field
function useSlashToFocus(input: HTMLTextAreaElement | null) {
  useEffect(() => {
    if (!input) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return
      event.preventDefault()
      input.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [input])
}

// how long each example question stays in the empty input
const ROTATE_MS = 3500

function RotatingPlaceholder({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, ROTATE_MS)
    return () => {
      clearInterval(id)
    }
  }, [items.length])

  return (
    <span
      key={index}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 top-1.5 animate-in truncate text-base text-muted-foreground duration-300 fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
    >
      {items[index % items.length]}
    </span>
  )
}

/**
 * Brings a new answer's first line into view while the reader is following,
 * and offers a jump instead when they have scrolled up to re-read.
 */
function useFollow(last: AssistantMessage | undefined) {
  const log = useRef<HTMLDivElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const atEnd = useRef(true)
  const lastId = useRef(last?.id)
  const [away, setAway] = useState(false)
  const [seen, setSeen] = useState(last?.id)
  const nodeOf = (id: string) =>
    log.current?.querySelector(`[data-message="${id}"]`)

  useEffect(() => {
    lastId.current = last?.id
  })

  // the end tells whether the reader is following; the latest answer counts as seen once in view
  useEffect(() => {
    const ends = end.current
    if (!ends) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === ends) {
          atEnd.current = entry.isIntersecting
          setAway(!entry.isIntersecting)
        }
        if (entry.isIntersecting) setSeen(lastId.current)
      }
    })
    observer.observe(ends)
    const answer =
      last?.role === "assistant"
        ? log.current?.querySelector(`[data-message="${last.id}"]`)
        : null
    if (answer) observer.observe(answer)
    return () => {
      observer.disconnect()
    }
  }, [last?.id, last?.role])

  useEffect(() => {
    if (!last) return
    if (last.role === "user") end.current?.scrollIntoView({ block: "end" })
    else if (atEnd.current)
      log.current
        ?.querySelector(`[data-message="${last.id}"]`)
        ?.scrollIntoView({ block: "start" })
  }, [last])

  return {
    log,
    end,
    unseen: away && last?.role === "assistant" && last.id !== seen,
    jump: () => {
      if (!last) return
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
      nodeOf(last.id)?.scrollIntoView({
        block: "start",
        behavior: reduce ? "auto" : "smooth",
      })
    },
  }
}

/** The assistant's face in the conversation. */
export function AssistantMark({
  size = "sm",
  busy = false,
  className,
}: {
  size?: "sm" | "lg"
  busy?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center bg-brand-muted text-brand-text",
        size === "sm" ? "size-7 rounded-lg" : "size-11 rounded-xl",
        busy && "animate-pulse motion-reduce:animate-none",
        className
      )}
    >
      <Sparkles className={size === "sm" ? "size-3.5" : "size-5"} />
    </span>
  )
}

/** A greeting and a few questions to start with. */
export function AssistantSuggestions({
  greeting,
  hint,
  prompts,
  onPick,
}: {
  greeting: string
  hint: string
  prompts: string[]
  onPick: Ask
}) {
  return (
    <div className="mt-auto flex animate-in flex-col gap-4 duration-300 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-start gap-3">
        <AssistantMark />
        <div className="flex min-w-0 flex-col gap-1 pt-0.5">
          <p className="font-semibold tracking-tight text-balance">
            {greeting}
          </p>
          <p className="text-sm text-pretty text-muted-foreground">{hint}</p>
        </div>
      </div>
      <AssistantPrompts prompts={prompts} onPick={onPick} className="ps-10" />
    </div>
  )
}

/** Questions as chips; picking one asks it. */
export function AssistantPrompts({
  prompts,
  onPick,
  className,
}: {
  prompts: string[]
  onPick: Ask
  className?: string
}) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {prompts.map((prompt) => (
        <li key={prompt}>
          <Button
            variant="outline"
            size="sm"
            className="h-auto rounded-full py-1.5 text-start whitespace-normal hover:border-brand/40 hover:text-brand-text"
            onClick={() => {
              onPick(prompt)
            }}
          >
            {prompt}
          </Button>
        </li>
      ))}
    </ul>
  )
}

// past this, a wait is long enough to say so
const SLOW_MS = 6000

function Thinking({ labels }: { labels: AssistantLabels }) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      setSlow(true)
    }, SLOW_MS)
    return () => {
      clearTimeout(id)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="mt-6 flex animate-in items-center gap-3 duration-200 fade-in motion-reduce:animate-none"
    >
      <span className="flex gap-1 text-muted-foreground">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
      <span
        key={String(slow)}
        className="animate-in text-sm text-muted-foreground duration-300 fade-in motion-reduce:animate-none"
      >
        {slow ? labels.slow : labels.thinking}
      </span>
    </div>
  )
}

function Message({
  message,
  labels,
  page,
  latest,
  onRetry,
}: {
  message: AssistantMessage
  labels: AssistantLabels
  page: boolean
  latest: boolean
  onRetry?: () => void
}) {
  if (message.role === "user")
    return (
      <div
        data-message={message.id}
        className={cn(
          "mt-10 flex animate-in flex-col items-end gap-1.5 duration-200 fade-in slide-in-from-bottom-2 first:mt-0 motion-reduce:animate-none",
          page ? "scroll-mt-32" : "scroll-mt-4"
        )}
      >
        <p className="max-w-[85%] min-w-12 rounded-2xl rounded-ee-md bg-primary px-3.5 py-2 text-center text-sm text-pretty whitespace-pre-wrap text-primary-foreground">
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
    <div
      data-message={message.id}
      className={cn(
        "group/answer relative mt-4 flex animate-in flex-col gap-2 duration-300 fade-in slide-in-from-bottom-2 first:mt-0 motion-reduce:animate-none",
        page ? "scroll-mt-32" : "scroll-mt-4"
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <span className="sr-only">{labels.assistant}: </span>
        <div className="max-w-prose text-sm text-pretty [&_:is(h1,h2,h3,h4)]:mt-4 [&_:is(h1,h2,h3,h4)]:mb-1 [&_:is(h1,h2,h3,h4)]:font-semibold [&_:is(h1,h2,h3,h4)]:tracking-tight [&_a]:font-medium [&_a]:text-brand-text [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:text-muted-foreground [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_li+li]:mt-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_ol+p]:mt-3 [&_p+ol]:mt-2 [&_p+p]:mt-3 [&_p+ul]:mt-2 [&_strong]:font-semibold [&_table]:my-2 [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:text-start [&_ul]:list-disc [&_ul]:ps-5 [&_ul+p]:mt-3 [&>*:first-child]:mt-0">
          <Suspense
            fallback={<p className="whitespace-pre-wrap">{message.text}</p>}
          >
            <Markdown components={{ a: MarkdownLink }}>{message.text}</Markdown>
          </Suspense>
        </div>
        <CopyAnswer text={message.text} labels={labels} latest={latest} />
      </div>
    </div>
  )
}

/** Labelled under the latest answer; on older ones it shows on hover. */
function CopyAnswer({
  text,
  labels,
  latest,
}: {
  text: string
  labels: AssistantLabels
  latest: boolean
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    []
  )

  return (
    <Button
      variant="ghost"
      size={latest ? "xs" : "icon-xs"}
      aria-label={latest ? undefined : copied ? labels.copied : labels.copy}
      className={cn(
        "text-muted-foreground",
        latest
          ? "-ms-2 self-start"
          : "absolute inset-s-0 top-full opacity-0 transition-opacity group-focus-within/answer:opacity-100 group-hover/answer:opacity-100 pointer-coarse:opacity-100"
      )}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => {
            setCopied(false)
          }, 1500)
        })
      }}
    >
      {copied ? (
        <Check
          key="done"
          className="animate-in text-success duration-150 zoom-in-50 motion-reduce:animate-none"
        />
      ) : (
        <Copy key="copy" />
      )}
      {latest && (
        <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
      )}
    </Button>
  )
}

/** App paths stay in the app, web links open in a new tab, anything else stays plain text. */
function MarkdownLink({ href = "", children }: ComponentProps<"a">) {
  const path = appPath(href)
  if (path) return <Link to={path}>{children}</Link>
  const url = href.startsWith("mailto:") ? href : safeUrl(href)
  if (!url) return <>{children}</>
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow">
      {children}
    </a>
  )
}

const SELF = "https://self.invalid"

function appPath(href: string) {
  if (!href.startsWith("/")) return null
  const url = new URL(href, SELF)
  return url.origin === SELF ? url.pathname + url.search + url.hash : null
}
