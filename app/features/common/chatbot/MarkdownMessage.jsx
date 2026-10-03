import { lazy, Suspense } from "react";

// react-markdown and remark-gfm are ~160 KB and only a bot answer needs them,
// so they are fetched on the first answer rather than with the chatbot route.
const MarkdownRenderer = lazy(() => import("./MarkdownRenderer"));

/**
 * Renders a bot answer. react-markdown parses the Markdown; the shadcn Typeset
 * classes (`typeset typeset-chat`, see app/styles/typeset.css) give the output
 * its rhythm. Until the parser lands the raw text stands in, inside the same
 * wrapper, so the bubble neither blanks nor jumps.
 */
export function MarkdownMessage({ content }) {
  return (
    <div className="typeset typeset-chat">
      <Suspense fallback={<p className="whitespace-pre-wrap">{content}</p>}>
        <MarkdownRenderer content={content} />
      </Suspense>
    </div>
  );
}

export default MarkdownMessage;
