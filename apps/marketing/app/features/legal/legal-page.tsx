import { LegalDocument } from "./components/legal-document"
import type { LegalNamespace } from "./lib/legal-doc"

export function LegalPage({ ns, path }: { ns: LegalNamespace; path: string }) {
  return <LegalDocument ns={ns} path={path} />
}
