import { useTranslation } from "@workspace/i18n/react"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item"

import { REQUIREMENTS, REQUIREMENTS_ANCHOR } from "../lib/sections"

export function SystemRequirements() {
  const { t } = useTranslation("interview")

  return (
    <section
      id={REQUIREMENTS_ANCHOR}
      aria-labelledby="requirements-title"
      className="flex scroll-mt-24 flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h2
          id="requirements-title"
          className="text-2xl font-semibold tracking-tight"
        >
          {t("requirements.title")}
        </h2>
        <p className="text-muted-foreground">{t("requirements.description")}</p>
      </div>
      <ItemGroup className="grid gap-3 sm:grid-cols-2">
        {REQUIREMENTS.map((id) => (
          <Item key={id} role="listitem" variant="outline">
            <ItemContent>
              <ItemTitle className="line-clamp-none">
                {t(`requirements.items.${id}.title`)}
              </ItemTitle>
              <ItemDescription className="line-clamp-none">
                {t(`requirements.items.${id}.desc`)}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </section>
  )
}
