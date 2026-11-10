import { createContext } from "react"

import type { Source } from "@/lib/blog/post"

export const SourcesContext = createContext<readonly Source[]>([])
