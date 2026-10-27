import { safeUrl } from "@workspace/api"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Copy, RotateCw } from "lucide-react"
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react"
import { Link } from "react-router"

import type { AssistantMessage } from "../assistant-store"
import type { AssistantLabels } from "./types"

const Markdown = lazy(() => import("react-markdown"))

// past this, a wait is long enough to say so
const SLOW_MS = 6000

export function Thinking({ labels }: { labels: AssistantLabels }) {
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

export function Message({
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
        <p className="max-w-[85%] min-w-12 rounded-2xl rounded-ee-md bg-primary px-3.5 py-2 text-start text-sm text-pretty whitespace-pre-wrap text-primary-foreground">
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
