import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Bot links open in a new tab, safely. Only href/children are pulled through so
// react-markdown's internal `node` prop never lands on the DOM element.
const MARKDOWN_COMPONENTS = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  // Block images from the bot response — prevents pixel-tracking / phishing.
  img: () => null,
};

// Allowlist of safe Markdown elements. Anything not listed here (e.g. script,
// iframe, object, embed, form, input) is silently stripped, so even if the API
// is compromised the rendered output cannot execute code or embed frames.
const ALLOWED_ELEMENTS = [
  "p", "br", "strong", "em", "del", "a",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "table", "thead", "tbody", "tr", "th", "td",
  "hr",
];

// remark-gfm adds tables/strikethrough/autolinks.
export function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={MARKDOWN_COMPONENTS}
      allowedElements={ALLOWED_ELEMENTS}
    >
      {content}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;

