import { useEffect } from "react"

import { useActiveStep } from "../hooks/use-active-step"
import { STEPS } from "../lib/guide-steps"
import { NeedCard } from "./need-card"
import { Scene } from "./scene-panel"
import { StepTimeline } from "./step-timeline"

export function InterviewGuide() {
  const { active, pick, register } = useActiveStep()
  const step = STEPS[active] ?? "download"

  useEffect(() => {
    try {
      localStorage.removeItem("guide:v1")
    } catch {
      /* empty */
    }
  }, [])

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:gap-12">
      <div className="flex flex-col gap-6 lg:pb-[35vh]">
        <div className="lg:hidden">
          <NeedCard />
        </div>
        <StepTimeline active={active} pick={pick} register={register} />
      </div>
      <div className="sticky top-20 hidden flex-col gap-4 lg:flex">
        <Scene step={step} play />
        <NeedCard />
      </div>
    </div>
  )
}
