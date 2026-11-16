import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { DownloadIcon, RotateCcwIcon } from "lucide-react"
import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
  use,
  useId,
  useRef,
} from "react"
import { useLocation } from "react-router"
import { z } from "zod"

import { localStore } from "../../lib/local-store"
import { fileName } from "../../lib/file-name"

// strings are item keys; numbers are the item indexes stored before items had keys
const makeStore = (key: string) =>
  localStore(
    `checklist:${key}`,
    z.array(z.union([z.string(), z.number().int().min(0)])).max(200),
    []
  )
const stores = new Map<string, ReturnType<typeof makeStore>>()
const storeFor = (key: string) => {
  let store = stores.get(key)
  if (!store) {
    store = makeStore(key)
    stores.set(key, store)
  }
  return store
}

const textOf = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children)
  return ""
}

// FNV-1a: short and stable, so a tick follows its item when others are added or moved
const hash = (text: string) => {
  let h = 0x811c9dc5
  for (const char of text.replace(/\s+/g, " ").trim()) {
    h ^= char.codePointAt(0) ?? 0
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

const keysOf = (items: readonly ReactNode[]) => {
  const seen = new Map<string, number>()
  return items.map((item) => {
    const key = hash(textOf(item))
    const n = seen.get(key) ?? 0
    seen.set(key, n + 1)
    return n ? `${key}.${n}` : key
  })
}

const Item = createContext<
  { checked: boolean; toggle: () => void } | undefined
>(undefined)

/** A list the reader can tick off; ticks stay in this browser, and it downloads as plain text. */
export function Checklist({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { t } = useTranslation("blog")
  const { pathname } = useLocation()
  const titleId = useId()
  const list = useRef<HTMLUListElement>(null)
  const store = storeFor(`${pathname}:${title}`)
  const items = Children.toArray(children).filter(
    (child) => typeof child !== "string" || child.trim()
  )
  const keys = keysOf(items)
  const stored = new Set(
    (store.useValue() ?? []).map((tick) =>
      typeof tick === "number" ? keys[tick] : tick
    )
  )
  const done = keys.filter((key) => stored.has(key))

  const toggle = (key: string) => {
    store.write(
      done.includes(key) ? done.filter((k) => k !== key) : [...done, key]
    )
  }

  const download = () => {
    const lines = [...(list.current?.querySelectorAll("label") ?? [])].map(
      (label, i) =>
        `[${done.includes(keys[i] ?? "") ? "x" : " "}] ${label.textContent.replace(/\s+/g, " ").trim()}`
    )
    const url = URL.createObjectURL(
      new Blob([`${title}\n\n${lines.join("\n")}\n`], { type: "text/plain" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = fileName(title, "txt")
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section
      aria-labelledby={titleId}
      className="my-2 flex flex-col gap-4 rounded-xl border p-5 text-base print:break-inside-avoid"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={titleId} className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p
          data-no-listen=""
          className="text-sm text-muted-foreground tabular-nums"
        >
          {t("mdx.checklist.progress", {
            done: done.length,
            count: items.length,
          })}
        </p>
      </div>
      <ul ref={list} className="flex flex-col gap-3">
        {items.map((child, index) => {
          const key = keys[index] ?? String(index)
          return (
            <Item
              key={key}
              value={{
                checked: done.includes(key),
                toggle: () => {
                  toggle(key)
                },
              }}
            >
              {child}
            </Item>
          )
        })}
      </ul>
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={download}>
          <DownloadIcon aria-hidden />
          {t("mdx.checklist.download")}
        </Button>
        {done.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              store.write([])
            }}
          >
            <RotateCcwIcon aria-hidden />
            {t("mdx.checklist.reset")}
          </Button>
        )}
      </div>
    </section>
  )
}

export function Check({ children }: { children: ReactNode }) {
  const item = use(Item)
  const id = useId()
  if (!item) return <li>{children}</li>

  return (
    <li className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={item.checked}
        onChange={item.toggle}
        className="peer mt-1.5 size-4 shrink-0 accent-brand"
      />
      <label
        htmlFor={id}
        className="text-pretty *:inline peer-checked:text-muted-foreground peer-checked:line-through"
      >
        {children}
      </label>
    </li>
  )
}
