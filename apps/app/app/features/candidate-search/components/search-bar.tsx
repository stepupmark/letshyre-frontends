import { useTranslation } from "@workspace/i18n/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { LoaderCircle, Search, X } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

const DEBOUNCE_MS = 300

export function SearchBar({
  value,
  busy,
  onSearch,
}: {
  value: string
  busy: boolean
  onSearch: (search: string) => void
}) {
  const { t } = useTranslation("candidateSearch")
  const id = useId()
  const [text, setText] = useState(value)
  const [synced, setSynced] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const input = useRef<HTMLInputElement>(null)

  // back, forward or a suggestion changed the URL under the field
  if (value !== synced) {
    setSynced(value)
    if (text.trim() !== value) setText(value)
  }

  useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    []
  )

  const send = (next: string, wait: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onSearch(next.trim())
    }, wait)
  }

  return (
    <form
      role="search"
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        send(text, 0)
      }}
    >
      <label htmlFor={id} className="text-sm font-medium">
        {t("searchLabel")}
      </label>
      <InputGroup className="h-12 rounded-xl bg-card has-[[data-slot=input-group-control]:focus-visible]:border-brand/60">
        <InputGroupAddon className="ps-4">
          <Search className="size-5 text-brand-text" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          ref={input}
          id={id}
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={80}
          placeholder={t("searchPlaceholder")}
          className="text-base"
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            send(event.target.value, DEBOUNCE_MS)
          }}
        />
        <InputGroupAddon align="inline-end" className="gap-1 pe-2">
          {busy && (
            <LoaderCircle
              role="status"
              aria-label={t("searching")}
              className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none"
            />
          )}
          {text && (
            <InputGroupButton
              size="icon-sm"
              aria-label={t("clearSearch")}
              className="max-md:size-11"
              onClick={() => {
                setText("")
                send("", 0)
                input.current?.focus()
              }}
            >
              <X />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
