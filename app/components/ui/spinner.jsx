import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

// Decorative, unlike upstream's role="status" aria-label="Loading": that label
// can't be translated here, so the caller provides the accessible text.
function Spinner({
  className,
  ...props
}) {
  return (
    <Loader2Icon
      aria-hidden="true"
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
      {...props} />
  );
}

export { Spinner }
