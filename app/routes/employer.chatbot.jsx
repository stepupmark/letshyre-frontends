import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";

export { Chatbot as default } from "@/features/employer/Chatbot";

// No data to prefetch — the assistant transcript is client state. The loader
// only exists so this route has one, matching its siblings.
export const clientLoader = authedPrefetch(async () => null);

export const meta = noindexMeta("employerChatbot");
