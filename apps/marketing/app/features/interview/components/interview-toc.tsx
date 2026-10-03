import { useTranslation } from "@workspace/i18n/react"

import { REQUIREMENTS_ANCHOR, STEPS, stepAnchor } from "../lib/sections"

export function InterviewToc() {
  const { t } = useTranslation("interview")

  return (
    <nav
      aria-labelledby="interview-toc"
      className="rounded-xl border p-5 lg:sticky lg:top-24 lg:self-start lg:border-0 lg:p-0"
    >
      <p id="interview-toc" className="text-sm font-medium">
        {t("toc.label")}
      </p>
      <p className="mt-4 text-xs font-medium text-muted-foreground">
        {t("toc.steps")}
      </p>
      <ol className="mt-2 flex list-inside list-decimal flex-col gap-2 text-sm text-muted-foreground">
        {STEPS.map((id) => (
          <li key={id}>
            <a
              href={`#${stepAnchor(id)}`}
              className="rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {t(`steps.${id}.title`)}
            </a>
          </li>
        ))}
      </ol>
      <a
        href={`#${REQUIREMENTS_ANCHOR}`}
        className="mt-4 inline-block rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {t("requirements.title")}
      </a>
    </nav>
  )
}
