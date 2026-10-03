import { BrainCircuit, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "./MarkdownMessage";
import { TypingIndicator } from "./TypingIndicator";


export function ChatMessage({ message, onRetry, accent, t }) {
  const isUser = message.role === "user";
  const speaker = isUser ? t("chatbot.you") : t("chatbot.assistant");

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[85%] rounded-2xl rounded-ee-sm px-4 py-2.5 text-sm break-words whitespace-pre-wrap text-white",
            accent.solid,
          )}
        >
          <span className="sr-only">{speaker}: </span>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar className="mt-0.5 size-8 shrink-0">
        <AvatarFallback className={cn(accent.softBg, accent.softText)}>
          <BrainCircuit size={18} strokeWidth={2} aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 max-w-[85%] rounded-2xl rounded-es-sm border border-border-soft bg-card px-4 py-3 text-sm text-text-body">
        <span className="sr-only">{speaker}: </span>
        {message.status === "pending" ? (
          <TypingIndicator />
        ) : message.status === "error" ? (
          <div className="flex flex-col items-start gap-2">
            <p className="m-0 text-text-muted">{t("chatbot.errorMessage")}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCcw size={14} aria-hidden="true" /> {t("chatbot.retry")}
            </Button>
          </div>
        ) : (
          <MarkdownMessage content={message.content} />
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
