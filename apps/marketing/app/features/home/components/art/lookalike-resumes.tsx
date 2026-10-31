import { useTranslation } from "@workspace/i18n/react"

const INITIALS = ["R", "S", "M"]

/** Three resumes built from the same three buzzwords. */
export default function LookalikeResumes() {
  const { t } = useTranslation("home")
  const words = t("tension.scene.buzzwords", { returnObjects: true })

  return (
    <div aria-hidden className="flex h-full flex-col justify-between gap-4">
      <div className="relative mx-auto h-36 w-full max-w-72">
        {INITIALS.map((initial, index) => (
          <div
            key={initial}
            className="pop-in absolute inset-x-0 top-0 rounded-xl border bg-card p-3"
            style={{
              translate: `${String((index - 1) * 14)}px ${String(index * 10)}px`,
              rotate: `${String((index - 1) * 3)}deg`,
              zIndex: index,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {initial}
              </span>
              <span className="h-1.5 w-20 rounded-full bg-foreground/15" />
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {words.map((word) => (
                <li
                  key={word}
                  className="relative rounded-md px-1.5 py-0.5 text-xs font-medium"
                >
                  <span className="grow-in absolute inset-0 origin-left rounded-md bg-brand-muted rtl:origin-right" />
                  <span className="relative">{word}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="tabular-nums">{t("tension.scene.resumes")}</span>
        <span className="font-medium text-foreground">
          {t("tension.scene.alike")}
        </span>
      </p>
    </div>
  )
}
