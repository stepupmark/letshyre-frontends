import { cn } from "@workspace/ui/lib/utils"
import {
  BriefcaseIcon,
  MessagesSquareIcon,
  NewspaperIcon,
  TrendingUpIcon,
  UserRoundCheckIcon,
} from "lucide-react"

import type { Post, Topic } from "@/lib/blog/post"

const TOPIC_ICONS = {
  interviewing: MessagesSquareIcon,
  hiring: UserRoundCheckIcon,
  careers: BriefcaseIcon,
  trends: TrendingUpIcon,
  news: NewspaperIcon,
} satisfies Record<Topic, unknown>

/** Decorative: the card's title is the link text. */
export function PostCover({
  post,
  priority = false,
  className,
}: {
  post: Pick<Post, "cover" | "topic">
  priority?: boolean
  className?: string
}) {
  const Icon = TOPIC_ICONS[post.topic]

  return (
    <div
      className={cn(
        "grid aspect-16/10 place-items-center overflow-hidden bg-brand-muted",
        className
      )}
    >
      {post.cover ? (
        <>
          <img
            src={post.cover.src}
            alt=""
            width={640}
            height={400}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className={cn(
              "size-full object-cover",
              post.cover.srcDark && "dark:hidden"
            )}
          />
          {post.cover.srcDark && (
            <img
              src={post.cover.srcDark}
              alt=""
              width={640}
              height={400}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="hidden size-full object-cover dark:block"
            />
          )}
        </>
      ) : (
        <Icon
          aria-hidden
          className="size-10 text-brand-text"
          strokeWidth={1.5}
        />
      )}
    </div>
  )
}
