import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainCircuit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useChatbot } from "@/features/common/chatbot/hooks/useChatbot";
import { sendPublicChatMessage } from "@/services/chatbot.service";
import { MessageList } from "./MessageList";
import { ChatComposer } from "./ChatComposer";
import { PUBLIC_ACCENT } from "./accents";

export function ChatWidget({
  chat = "public",
  namespace = "home",
  sender = sendPublicChatMessage,
  accent = PUBLIC_ACCENT,
} = {}) {
  const { t } = useTranslation(namespace);
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, retryLast, clear, isPending, draft, setDraft } = useChatbot({
    chat,
    sender,
  });

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-6 end-6 z-40 size-14 rounded-full text-white shadow-lg transition-transform hover:scale-105 motion-reduce:hover:scale-100 md:me-6 mb-2",
            accent.solid,
            accent.solidHover,
          )}
          aria-label={open ? t("chatbot.closeAria") : t("chatbot.launcherAria")}
        >
          {open ? (
            <X size={24} aria-hidden="true" />
          ) : (
            <BrainCircuit size={24} aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={14}
        onInteractOutside={(e) => e.preventDefault()}
        aria-label={t("chatbot.title")}
        className="flex h-[70vh] max-h-[600px] w-[calc(100vw-2rem)] max-w-xl flex-col overflow-hidden p-0"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-border-soft px-4 py-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full",
              accent.softBg,
              accent.softText,
            )}
          >
            <BrainCircuit size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 truncate text-sm font-bold text-text-main">
              {t("chatbot.title")}
            </h2>
            <p className="m-0 truncate text-xs text-text-muted">
              {t("chatbot.subtitle")}
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs text-text-muted"
              onClick={clear}
            >
              {t("chatbot.clear")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-text-muted"
            onClick={() => setOpen(false)}
            aria-label={t("chatbot.closeAria")}
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-4">
          <MessageList
            messages={messages}
            onRetry={retryLast}
            onPrompt={handlePrompt}
            accent={accent}
            t={t}
          />
        </div>

        <div className="shrink-0 border-t border-border-soft p-3">
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
      </PopoverContent>
    </Popover>
  );
}

export default ChatWidget;
