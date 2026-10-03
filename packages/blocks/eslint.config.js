import { react } from "@workspace/eslint-config/react"

export default react({
  tsconfigRootDir: import.meta.dirname,
  library: true,
  tailwind: true,
})
