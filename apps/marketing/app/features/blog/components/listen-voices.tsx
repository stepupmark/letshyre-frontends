import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { AudioLinesIcon } from "lucide-react"
import { useId } from "react"

import type { Listen } from "../hooks/use-listen"

// a popover, not a menu: the page already loads it, and a menu puts posts over the JS budget
export function ListenVoices({ listen }: { listen: Listen }) {
  const { t } = useTranslation("blog")
  const name = useId()
  if (listen.voices.length < 2) return null

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("post.voice")} />
        }
      >
        <AudioLinesIcon aria-hidden />
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-[calc(100vw-2rem)] gap-1">
        <PopoverTitle className="px-2 pt-1 text-xs text-muted-foreground">
          {t("post.voice")}
        </PopoverTitle>
        <fieldset className="flex max-h-72 flex-col overflow-y-auto">
          <legend className="sr-only">{t("post.voice")}</legend>
          {listen.voices.map((voice) => (
            <label
              key={voice.uri}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name={name}
                value={voice.uri}
                checked={voice.uri === listen.voice}
                onChange={() => {
                  listen.setVoice(voice.uri)
                }}
                className="size-4 shrink-0 accent-brand outline-none"
              />
              <span className="min-w-0 truncate">{voice.name}</span>
            </label>
          ))}
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}
