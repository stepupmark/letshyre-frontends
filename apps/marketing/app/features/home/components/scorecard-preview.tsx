import { useFormat, useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { DEMO_SCORECARD } from "../lib/demo-scorecard"

const COL = "col"
const ROW = "row"

export function ScorecardPreview() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const format = useFormat()

  return (
    <figure className="flex w-full max-w-lg flex-col gap-3 justify-self-center lg:justify-self-end">
      <Card className="gap-5">
        <CardHeader>
          <CardTitle>{t("preview.candidate")}</CardTitle>
          <CardDescription>{t("preview.role")}</CardDescription>
          <CardAction>
            <Badge>{t("preview.recommendation")}</Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {t("preview.overall")}
            </p>
            <p className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">
                {format.number(DEMO_SCORECARD.overall)}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("preview.outOf", {
                  max: format.number(DEMO_SCORECARD.max),
                })}
              </span>
            </p>
          </div>
          <Badge variant="outline">{t("preview.notice")}</Badge>
        </CardContent>

        <CardContent className="flex flex-col gap-4">
          <Separator />
          <p className="text-sm font-medium">{t("preview.skillsHeading")}</p>
          {DEMO_SCORECARD.skills.map((skill) => (
            <Progress
              key={skill.id}
              value={skill.score}
              max={DEMO_SCORECARD.max}
              locale={lang}
              format={{ style: "decimal" }}
              // the label links itself only after hydration
              aria-label={t(`preview.skills.${skill.id}`)}
              className="gap-2"
            >
              <ProgressLabel className="font-normal">
                {t(`preview.skills.${skill.id}`)}
              </ProgressLabel>
              <ProgressValue />
            </Progress>
          ))}
        </CardContent>

        <CardContent>
          <Separator className="mb-4" />
          <Table className="caption-top">
            <TableCaption className="mt-0 mb-2 text-start font-medium text-foreground">
              {t("preview.checks.caption")}
            </TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope={COL} className="ps-0 text-muted-foreground">
                  {t("preview.checks.check")}
                </TableHead>
                <TableHead
                  scope={COL}
                  className="pe-0 text-end text-muted-foreground"
                >
                  {t("preview.checks.result")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_SCORECARD.checks.map((check) => (
                <TableRow key={check} className="hover:bg-transparent">
                  <TableHead scope={ROW} className="ps-0 font-normal">
                    {t(`preview.checks.rows.${check}.label`)}
                  </TableHead>
                  <TableCell className="pe-0 text-end">
                    {t(`preview.checks.rows.${check}.result`)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <figcaption className="text-center text-sm text-muted-foreground">
        {t("preview.label")}
      </figcaption>
    </figure>
  )
}
