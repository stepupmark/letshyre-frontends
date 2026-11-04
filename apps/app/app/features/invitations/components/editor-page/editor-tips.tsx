import { useTranslation } from "@workspace/i18n/react"
import { Kbd } from "@workspace/ui/components/kbd"

export function EditorTips() {
  const { t } = useTranslation("invitations")
  return (
    <section className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
      <h2 className="font-medium">{t("editor.tipsTitle")}</h2>
      <p className="text-pretty text-muted-foreground">
        <Kbd>{t("toolbar.keys.field")}</Kbd> {t("editor.tipField")}
      </p>
      <p className="text-pretty text-muted-foreground">
        <Kbd>{t("toolbar.keys.link")}</Kbd> {t("editor.tipLink")}
      </p>
    </section>
  )
}
