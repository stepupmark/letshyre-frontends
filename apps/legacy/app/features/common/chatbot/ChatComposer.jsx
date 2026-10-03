import { SendHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export function ChatComposer({ value, onChange, onSubmit, disabled, inputRef, accent, t }) {
  const canSend = value.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={t("chatbot.inputPlaceholder")}
        aria-label={t("chatbot.inputPlaceholder")}
        className="max-h-40 min-h-11 flex-1 resize-none bg-card"
      />
      <Button
        type="button"
        size="icon"
        className={cn("size-11 shrink-0 text-white", accent.solid, accent.solidHover)}
        onClick={submit}
        disabled={!canSend}
        aria-label={t("chatbot.sendAria")}
      >
        <SendHorizontal size={18} className="rtl:-scale-x-100" aria-hidden="true" />
      </Button>
    </div>
  );
}

export default ChatComposer;
