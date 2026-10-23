import { useTranslation } from "@workspace/i18n/react"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

const MATCHED = "matched"
const APPLIED = "applied"

export function ScopeTabs({
  applied,
  onChange,
}: {
  applied: boolean
  onChange: (applied: boolean) => void
}) {
  const { t } = useTranslation("matches")
  return (
    <Tabs
      value={applied ? APPLIED : MATCHED}
      onValueChange={(value) => {
        onChange(value === APPLIED)
      }}
    >
      <TabsList aria-label={t("scope.label")} className="w-full sm:w-auto">
        <TabsTrigger value={MATCHED}>{t("scope.matched")}</TabsTrigger>
        <TabsTrigger value={APPLIED}>{t("scope.applied")}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
