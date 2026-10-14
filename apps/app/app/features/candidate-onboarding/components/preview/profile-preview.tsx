import type { ComponentProps } from "react"

import { ProfileCard } from "./profile-card"

type Props = ComponentProps<typeof ProfileCard>

/** Mirrors the form, so it's hidden from assistive tech. */
export function ProfilePreview(props: Props) {
  return (
    <aside aria-hidden="true" className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_70%_20%,var(--brand-muted),transparent_65%)]" />
      <ProfileCard {...props} />
    </aside>
  )
}
