import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { dirFor } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CircleAlert, Eye, Sparkles } from "lucide-react"
import * as m from "motion/react-m"
import { useEffect, useRef, useState } from "react"
import { useWatch } from "react-hook-form"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { FileDropzone } from "@/components/file-dropzone"
import { TextField } from "@/components/text-field"
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import type { FileRules } from "@/lib/file-rules"
import { industriesQuery } from "@/lib/industries"
import { duration, ease } from "@/lib/motion"
import { useGo } from "@/lib/navigation"

import { createJob, JOBS_KEY, parseJd } from "./api"
import { JobForm } from "./job-form"
import { JobView } from "./job-view"
import { useJobForm } from "./use-job-form"
import { EMPTY, fromParsed, toCreateForm, type JobValues } from "./values"

const DRAFT = "post-job"
const JD_RULES: FileRules = {
  accept: [".pdf", ".doc", ".docx"],
  maxBytes: 5 * 1024 * 1024,
}

interface Draft {
  values: JobValues
  fromJd: Partial<JobValues>
}

export function PostJob() {
  const { t } = useTranslation("jobs")
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState(() => loadDraft<Draft>(DRAFT))
  const [restored, setRestored] = useState(Boolean(draft?.values))
  const [fromJd, setFromJd] = useState<Partial<JobValues>>(draft?.fromJd ?? {})
  const [jd, setJd] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [missing, setMissing] = useState<"file" | "title" | null>(null)
  const industries = useQuery(industriesQuery())
  const { form, showServerErrors } = useJobForm(
    { ...EMPTY, ...draft?.values },
    { isNew: true }
  )

  const reviewing = params.get("step") === "review" || Boolean(draft?.values)
  const toReview = () => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("step", "review")
      return next
    })
  }

  const parse = useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) =>
      parseJd(file, title),
    onSuccess: (jdFields, { title }) => {
      const result = fromParsed(jdFields, title, industries.data ?? [])
      form.reset(result.values)
      setFromJd(result.fromJd)
      setRestored(false)
      toReview()
    },
  })

  return reviewing ? (
    <Review
      form={form}
      fromJd={fromJd}
      jd={jd}
      restored={restored}
      industries={industries.data ?? []}
      showServerErrors={showServerErrors}
      onStartOver={() => {
        clearDraft(DRAFT)
        setDraft(null)
        setFromJd({})
        setRestored(false)
        form.reset(EMPTY)
        setParams({}, { replace: true })
      }}
    />
  ) : (
    <Card className="max-w-2xl">
      <CardContent className="flex flex-col gap-6">
        <FileDropzone
          label={t("post.jdLabel")}
          description={t("post.jdHint")}
          rules={JD_RULES}
          value={jd}
          error={missing === "file" ? t("post.needFile") : undefined}
          onSelect={(file) => {
            setJd(file)
            if (file) setMissing(null)
          }}
        />
        <TextField
          label={t("post.titleLabel")}
          hint={t("post.titleHint")}
          value={title}
          autoComplete="off"
          error={missing === "title" ? t("post.needTitle") : undefined}
          onChange={(event) => {
            setTitle(event.target.value)
            if (event.target.value.trim() && missing === "title")
              setMissing(null)
          }}
        />
        {parse.isPending && (
          <m.div
            role="status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, ease }}
            className="flex items-start gap-3 rounded-lg border p-4 text-sm"
          >
            <Spinner className="mt-0.5" />
            <div>
              <p className="font-medium">{t("post.reading")}</p>
              <p className="text-muted-foreground">{t("post.readingHint")}</p>
            </div>
          </m.div>
        )}
        {parse.isError && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{t("post.readFailed")}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          disabled={parse.isPending}
          onClick={() => {
            if (!jd) {
              setMissing("file")
              return
            }
            if (!title.trim()) {
              setMissing("title")
              return
            }
            parse.mutate({ file: jd, title: title.trim() })
          }}
        >
          <Sparkles />
          {t("post.read")}
        </Button>
        <Button
          variant="ghost"
          disabled={parse.isPending}
          onClick={() => {
            form.reset({ ...EMPTY, title: title.trim() })
            setFromJd({})
            toReview()
          }}
        >
          {t("post.manual")}
        </Button>
      </CardFooter>
    </Card>
  )
}

function Review({
  form,
  fromJd,
  jd,
  restored,
  industries,
  showServerErrors,
  onStartOver,
}: {
  form: ReturnType<typeof useJobForm>["form"]
  fromJd: Partial<JobValues>
  jd: File | null
  restored: boolean
  industries: { value: string; label: string }[]
  showServerErrors: (error: unknown) => boolean
  onStartOver: () => void
}) {
  const { t } = useTranslation("jobs")
  const side = dirFor(useLocale()) === "rtl" ? "left" : "right"
  const queryClient = useQueryClient()
  const go = useGo()
  const [previewing, setPreviewing] = useState(false)
  const [saved, setSaved] = useState(false)
  const values = useWatch({ control: form.control }) as JobValues
  const filled = Object.keys(fromJd).length

  // drafts as the employer types; the JD file stays in memory only
  const json = JSON.stringify(values)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = setTimeout(() => {
      saveDraft(DRAFT, { values: form.getValues(), fromJd })
      setSaved(true)
    }, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [json, form, fromJd])

  const post = useMutation({
    mutationFn: (values: JobValues) => createJob(toCreateForm(values, jd)),
    onSuccess: async (job) => {
      clearDraft(DRAFT)
      await queryClient.invalidateQueries({ queryKey: JOBS_KEY })
      toast.success(t("post.posted"), { description: t("post.postedBody") })
      go(job.id ? `/employer/view-jobs/${job.id}` : "/employer/view-jobs")
    },
    onError: (error) => {
      showServerErrors(error)
    },
  })

  return (
    <form
      noValidate
      className="flex max-w-3xl flex-col gap-8"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          post.mutate(values)
        })(event)
      }}
    >
      {(filled > 0 || restored) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
          <p className="flex items-center gap-2">
            {filled > 0 && (
              <Sparkles className="size-4 text-info" aria-hidden="true" />
            )}
            {filled > 0
              ? t("post.filledBanner", { count: filled })
              : t("post.restored")}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={onStartOver}>
            {t("post.startOver")}
          </Button>
        </div>
      )}

      <JobForm form={form} industries={industries} fromJd={fromJd} isNew />

      {post.isError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{t("post.submitFailed")}</AlertDescription>
        </Alert>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <Button type="submit" disabled={post.isPending}>
          {post.isPending && <Spinner />}
          {post.isPending ? t("post.submitting") : t("post.submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPreviewing(true)
          }}
        >
          <Eye />
          {t("post.preview")}
        </Button>
        {saved && (
          <p className="ms-auto text-xs text-muted-foreground" role="status">
            {t("post.draftSaved")}
          </p>
        )}
      </div>

      <Sheet open={previewing} onOpenChange={setPreviewing}>
        <SheetContent side={side} className="w-full gap-0 sm:max-w-lg">
          <SheetHeader className="border-b">
            <SheetTitle className="text-lg">
              {values.title.trim() || t("preview.title")}
            </SheetTitle>
            <SheetDescription>{t("preview.lead")}</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto p-4">
            <JobView values={values} industries={industries} />
          </div>
        </SheetContent>
      </Sheet>
    </form>
  )
}
