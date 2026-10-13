import { useTranslation } from "@workspace/i18n/react"
import { Info } from "lucide-react"
import { useEffect, useState } from "react"

/** Logos show in a square, so a wide or tall one gets cropped. */
export function LogoNote({ file }: { file: unknown }) {
  const { t } = useTranslation("onboarding")
  const [measured, setMeasured] = useState<{
    file: File
    width: number
    height: number
  }>()
  const size = measured?.file === file ? measured : undefined

  useEffect(() => {
    if (!(file instanceof File) || !file.type.startsWith("image/")) return
    let live = true
    void createImageBitmap(file)
      .then((bitmap) => {
        if (live)
          setMeasured({ file, width: bitmap.width, height: bitmap.height })
        bitmap.close()
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [file])

  if (!size) return null
  const ratio = size.width / size.height
  if (ratio > 0.8 && ratio < 1.25) return null

  return (
    <p className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
      <Info className="size-3.5 shrink-0" />
      {t("documents.logoNotSquare", {
        width: size.width,
        height: size.height,
      })}
    </p>
  )
}
