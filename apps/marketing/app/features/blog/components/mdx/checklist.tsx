import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { DownloadIcon, RotateCcwIcon } from "lucide-react"
import {
  Children,
  createContext,
  type ReactNode,
  use,
  useId,
  useRef,
} from "react"
import { useLocation } from "react-router"
import { z } from "zod"

import { localStore } from "../../lib/local-store"
import { fileName } from "../../lib/file-name"

const makeStore = (key: string) =>
  localStore(`checklist:${key}`, z.array(z.number().int().min(0)).max(100), [])
const stores = new Map<string, ReturnType<typeof makeStore>>()
const storeFor = (key: string) => {
  let store = stores.get(key)
  if (!store) {
    store = makeStore(key)
    stores.set(key, store)
  }
  return store
}

const Item = createContext<{ index: number; storeKey: string } | undefined>(
  undefined
)

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
  const storeKey = `${pathname}:${title}`
  const store = storeFor(storeKey)
  const done = store.useValue() ?? []
  const items = Children.toArray(children).filter(
    (child) => typeof child !== "string" || child.trim()
  )

  const download = () => {
    const lines = [...(list.current?.querySelectorAll("label") ?? [])].map(
      (label, i) =>
        `[${done.includes(i) ? "x" : " "}] ${label.textContent.replace(/\s+/g, " ").trim()}`
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
        <p className="text-sm text-muted-foreground tabular-nums">
          {t("mdx.checklist.progress", {
            done: done.length,
            count: items.length,
          })}
        </p>
      </div>
      <ul ref={list} className="flex flex-col gap-3">
        {items.map((child, index) => (
          <Item key={index} value={{ index, storeKey }}>
            {child}
          </Item>
        ))}
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
  const store = storeFor(item?.storeKey ?? "")
  const done = store.useValue() ?? []
  if (!item) return <li>{children}</li>
  const checked = done.includes(item.index)

  return (
    <li className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => {
          store.write(
            checked
              ? done.filter((i) => i !== item.index)
              : [...done, item.index]
          )
        }}
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
