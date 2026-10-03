import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";

export { Chatbot as default } from "@/features/employee/Chatbot";

export const clientLoader = authedPrefetch(async () => null);

export const meta = noindexMeta("employeeChatbot");
