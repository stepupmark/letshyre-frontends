import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatbot } from "@/features/common/chatbot/hooks/useChatbot";
import { MessageList } from "./MessageList";
import { ChatComposer } from "./ChatComposer";

export function ChatbotScreen({ chat, namespace, accent, className }) {
  const { t } = useTranslation(namespace);
  const { messages, sendMessage, retryLast, clear, isPending, draft, setDraft } = useChatbot({ chat });

  const inputRef = useRef(null);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text || isPending) return;
    sendMessage(text);
    setDraft("");
    // Keep focus in the composer for rapid follow-ups.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handlePrompt = (text) => {
    setDraft(text);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("absolute inset-0 flex flex-col max-lg:p-4 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))]", className)}>
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 pb-4">
          <div>
            <h1 className="m-0 text-lg font-bold text-text-main">
              {t("chatbot.title")}
            </h1>
            <p className="m-0 text-sm text-text-muted">
              {t("chatbot.subtitle")}
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-text-muted"
              onClick={clear}
            >
              <Trash2 size={15} aria-hidden="true" /> {t("chatbot.clear")}
            </Button>
          )}
        </header>

        {/* The only scroll region — header and composer stay pinned. */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <MessageList
            messages={messages}
            onRetry={retryLast}
            onPrompt={handlePrompt}
            accent={accent}
            t={t}
          />
        </div>

        <div className="shrink-0 pt-3">
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            disabled={isPending}
            inputRef={inputRef}
            accent={accent}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatbotScreen;
