import type { ReactNode } from "react"

import { SketchWindow } from "@/components/art/sketch-window"

import type { ChapterId } from "../../lib/chapters"
import { AfterScene, InterviewScene } from "./interview-scenes"
import { AccountScene, DocumentsScene, ProfileScene } from "./join-scenes"
import { AppScene, ChecksScene, RoleScene } from "./prepare-scenes"

const SCENES: Record<ChapterId, () => ReactNode> = {
  account: AccountScene,
  profile: ProfileScene,
  documents: DocumentsScene,
  app: AppScene,
  checks: ChecksScene,
  role: RoleScene,
  interview: InterviewScene,
  after: AfterScene,
}

/** What the candidate sees at each chapter. */
export function Scene({ chapter }: { chapter: ChapterId }) {
  const Content = SCENES[chapter]
  return (
    <SketchWindow>
      <Content />
    </SketchWindow>
  )
}
