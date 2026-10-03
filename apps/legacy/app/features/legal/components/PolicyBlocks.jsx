import React from "react";
import { Tooltip } from "@/features/legal/components/Tooltip";

const HIGHLIGHT =
  "rounded-[4px] px-[0.2rem] font-semibold text-text-body bg-[linear-gradient(120deg,rgba(115,165,239,0.3)_0%,rgba(115,165,239,0.1)_100%)]";

const CONTACT_CARD =
  "relative overflow-hidden rounded-lg border border-border p-10 bg-[linear-gradient(to_right,var(--color-bg-subtle),var(--color-white))] before:absolute before:top-0 before:start-0 before:h-full before:w-1.5 before:bg-brand-400 before:content-['']";

const EMAIL_LINK =
  "text-[1.2rem] font-semibold text-brand-400 no-underline transition-colors hover:text-brand-600 hover:underline";

// Runs let a translated string carry inline emphasis without HTML in the JSON:
// a plain string, or an array mixing strings with { highlight } / { tip, tooltip }.
function renderRuns(content) {
  if (typeof content === "string") return content;
  return content.map((run, i) => {
    if (typeof run === "string") return <React.Fragment key={i}>{run}</React.Fragment>;
    if (run.tip) {
      return (
        <Tooltip key={i} text={run.tooltip}>
          <span className={HIGHLIGHT}>{run.tip}</span>
        </Tooltip>
      );
    }
    if (run.highlight) {
      return (
        <span key={i} className={HIGHLIGHT}>
          {run.highlight}
        </span>
      );
    }
    return null;
  });
}

// Renders a legal document's translated block content (paragraphs, lists,
// subheadings, spacers, contact cards) — the block schema lives in each
// locale's legal.json so translators only ever touch text, never markup.
export function PolicyBlocks({ blocks }) {
  return (
    <>
      {(blocks || []).map((block, i) => {
        switch (block.type) {
          case "p":
            return <p key={i}>{renderRuns(block.text)}</p>;
          case "subheading":
            return (
              <p key={i}>
                <strong>{block.text}</strong>
              </p>
            );
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderRuns(item)}</li>
                ))}
              </ul>
            );
          case "spacer":
            return <br key={i} />;
          case "contact":
            return (
              <div key={i} className={CONTACT_CARD}>
                <p>
                  {block.intro}
                  <br />
                  {block.emailLabel}{" "}
                  <a href={`mailto:${block.email}`} className={EMAIL_LINK}>
                    {block.email}
                  </a>
                  <br />
                  {block.team}
                </p>
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
