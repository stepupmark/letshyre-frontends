import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowUp, Square, Trash2 } from "lucide-react"
import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import {
  ask,
  clear,
  snapshot,
  stop,
  subscribe,
  type AssistantMessage,
  type AssistantSend,
} from "./assistant-store"
import { Message, Thinking } from "./assistant/message"
import {
  AssistantMark,
  AssistantPrompts,
  AssistantSuggestions,
  RotatingPlaceholder,
} from "./assistant/prompts"
import type { AssistantLabels, Ask } from "./assistant/types"
import { useFollow, useSlashToFocus } from "./assistant/hooks"

export type { AssistantLabels, AssistantMessage, AssistantSend }
export { AssistantMark, AssistantPrompts, AssistantSuggestions }

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

export function AssistantChat({
  chat,
  labels,
  welcome,
  suggestions,
  next,
  onClear,
  tools,
  hint,
  notice,
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
  /** Shows an inline Clear in a panel and gets its undo; without it the host clears the chat itself. */
  onClear?: (undo: () => void) => void
  /** At the start of the input once the conversation has begun. */
  tools?: ReactNode
  /** Under the input before the first message. */
  hint?: string
  /** Under the input for the whole conversation. */
  notice?: ReactNode
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
        {notice}
        {!page && !empty && !pending && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="self-start text-muted-foreground"
            onClick={() => {
              onClear(chat.clear())
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
