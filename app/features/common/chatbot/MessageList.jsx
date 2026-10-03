import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { EmptyState } from "./EmptyState";


export function MessageList({ messages, onRetry, onPrompt, accent, t }) {
  const logRef = useRef(null);
  const bottomRef = useRef(null);
  const restored = useRef(false);
  const atBottom = useRef(true);
  const isEmpty = messages.length === 0;

  // Jump straight to the end of a restored chat; animate only new messages.
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: restored.current ? "smooth" : "instant", block: "end" });
    restored.current = true;
  }, [messages]);

  // Bot replies render Markdown lazily and grow after the scroll above, so
  // stay pinned to the end while the reader is there.
  useEffect(() => {
    const log = logRef.current;
    const bottom = bottomRef.current;
    if (!log || !bottom || typeof ResizeObserver === "undefined" || typeof IntersectionObserver === "undefined") return;
    const visibility = new IntersectionObserver(([entry]) => {
      atBottom.current = entry.isIntersecting;
    });
    const size = new ResizeObserver(() => {
      if (atBottom.current) bottom.scrollIntoView({ behavior: "instant", block: "end" });
    });
    visibility.observe(bottom);
    size.observe(log);
    return () => {
      visibility.disconnect();
      size.disconnect();
    };
  }, [isEmpty]);

  if (isEmpty) {
    return <EmptyState onPrompt={onPrompt} accent={accent} t={t} />;
  }

  return (
    <div
      ref={logRef}
      className="flex flex-col gap-4 py-1 pe-1"
      role="log"
      aria-live="polite"
      aria-label={t("chatbot.messagesLabel")}
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRetry={onRetry}
          accent={accent}
          t={t}
        />
      ))}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}

export default MessageList;
