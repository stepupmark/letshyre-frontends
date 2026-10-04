import { useTranslation } from "@workspace/i18n/react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { CircleCheck } from "lucide-react"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

import type { AttentionItem } from "./use-attention"

export function AttentionList({ items }: { items: AttentionItem[] }) {
  const { t } = useTranslation("dashboard")

  return (
    <section aria-labelledby="attention" className="flex flex-col gap-3">
      <h2 id="attention" className="text-base font-medium">
        {t("attention.heading")}
      </h2>
      {items.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border p-4 text-sm">
          <CircleCheck
            className="size-4 shrink-0 text-success"
            aria-hidden="true"
          />
          <p>
            <span className="font-medium">{t("attention.clear.title")}</span>{" "}
            <span className="text-muted-foreground">
              {t("attention.clear.body")}
            </span>
          </p>
        </div>
      ) : (
        <ItemGroup className="gap-0 divide-y rounded-lg border">
          {items.map((item) => (
            <Item key={item.key} role="listitem">
              <ItemMedia variant="icon">{item.icon}</ItemMedia>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.body}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <AppLink
                  to={item.to}
                  className={buttonLink({ variant: "outline", size: "sm" })}
                >
                  {item.action}
                </AppLink>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </section>
  )
}
