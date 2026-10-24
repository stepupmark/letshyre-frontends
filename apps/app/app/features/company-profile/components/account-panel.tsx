import { useSession } from "@workspace/auth/react"
import { useTranslation } from "@workspace/i18n/react"

import { accountOf } from "../lib/company"
import { Fact, Panel } from "./parts"

export function AccountPanel() {
  const { t } = useTranslation("company")
  const session = useSession()
  if (session.status !== "signed-in") return null
  const account = accountOf(session.user)
  const facts = [
    [t("account.name"), account.name],
    [t("account.email"), account.email],
    [t("account.phone"), account.phone],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]))
  if (facts.length === 0) return null

  return (
    <Panel title={t("account.title")}>
      <dl className="flex flex-col gap-4">
        {facts.map(([label, value]) => (
          <Fact key={label} label={label}>
            {value}
          </Fact>
        ))}
      </dl>
    </Panel>
  )
}
