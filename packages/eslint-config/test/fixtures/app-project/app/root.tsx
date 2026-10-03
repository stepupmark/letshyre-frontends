import { SiteLayout } from "@/layouts/site-layout"
import { formatTitle } from "@/lib/format"

const siteName = "LetsHyre"

export default function Root() {
  return <SiteLayout title={formatTitle(siteName)} />
}
