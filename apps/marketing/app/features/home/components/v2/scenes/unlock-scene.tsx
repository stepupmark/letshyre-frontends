import { useTranslation } from "@workspace/i18n/react"
import {
  CoinsIcon,
  FileTextIcon,
  LockIcon,
  LockOpenIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react"

import { Avatar } from "@/components/art/avatar"

import { Panel, Stage } from "../stage"

export function UnlockScene() {
  const { t } = useTranslation("homeV2")
  const files = t("unlock.scene.files", { returnObjects: true })

  return (
    <Stage label={t("unlock.scene.label")} className="unlock-stage">
      <Panel className="ms-auto flex w-fit items-center gap-2 px-3 py-2 text-sm">
        <CoinsIcon className="size-4 text-brand-text" />
        <span className="text-muted-foreground">
          {t("unlock.scene.credits")}
        </span>
        <span className="grid font-semibold tabular-nums">
          <span className="unlock-out col-start-1 row-start-1 opacity-0">
            10
          </span>
          <span className="unlock-in col-start-1 row-start-1">9</span>
        </span>
      </Panel>

      <Panel className="mt-3">
        <div className="flex items-center gap-3 p-4 sm:p-5">
          <Avatar name={t("unlock.scene.name")} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("unlock.scene.name")}</p>
            <p className="text-sm text-muted-foreground">
              {t("unlock.scene.role")}
            </p>
          </div>
          <span className="grid text-xs font-medium">
            <span className="unlock-out col-start-1 row-start-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-muted-foreground opacity-0">
              <LockIcon className="size-3" />
              {t("unlock.scene.locked")}
            </span>
            <span className="unlock-in col-start-1 row-start-1 inline-flex items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-brand-text">
              <LockOpenIcon className="size-3" />
              {t("unlock.scene.unlocked")}
            </span>
          </span>
        </div>

        <div className="border-t px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-foreground">
            {t("unlock.scene.free")}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">
                {t("unlock.scene.match")}
              </dt>
              <dd className="text-lg font-semibold text-brand-text tabular-nums">
                86
              </dd>
            </div>
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">
                {t("unlock.scene.interview")}
              </dt>
              <dd className="text-lg font-semibold tabular-nums">
                78
                <span className="text-xs font-normal text-muted-foreground">
                  {t("unlock.scene.outOf")}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid border-t">
          <div className="unlock-out col-start-1 row-start-1 flex flex-col gap-3 p-4 opacity-0 sm:p-5">
            <span className="flex items-center gap-2 text-sm">
              <MailIcon className="size-4 text-muted-foreground" />
              <span className="blur-xs select-none">
                {t("unlock.scene.email")}
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm tabular-nums">
              <PhoneIcon className="size-4 text-muted-foreground" />
              <span className="blur-xs select-none">
                {t("unlock.scene.phone")}
              </span>
            </span>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              <LockOpenIcon className="size-3.5" />
              {t("unlock.scene.unlock")}
            </span>
          </div>
          <div className="unlock-in col-start-1 row-start-1 flex flex-col gap-3 p-4 sm:p-5">
            <span className="flex items-center gap-2 text-sm">
              <MailIcon className="size-4 text-muted-foreground" />
              {t("unlock.scene.email")}
            </span>
            <span className="flex items-center gap-2 text-sm tabular-nums">
              <PhoneIcon className="size-4 text-muted-foreground" />
              {t("unlock.scene.phone")}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {files.map((file) => (
                <span
                  key={file}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                >
                  <FileTextIcon className="size-3 text-brand-text" />
                  {file}
                </span>
              ))}
            </span>
          </div>
        </div>
      </Panel>
    </Stage>
  )
}
