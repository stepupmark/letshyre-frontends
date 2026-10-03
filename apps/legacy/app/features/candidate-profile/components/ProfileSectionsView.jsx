import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

// Applies the entrance-stagger class only the first time a section key mounts;
// the decision is captured once so it stays stable for the panel's lifetime.
function AnimatedPanel({ sectionKey, seenSet, className, children, ...rest }) {
  const [animate] = useState(() => {
    const firstReveal = !seenSet.has(sectionKey);
    seenSet.add(sectionKey);
    return firstReveal;
  });
  return (
    <div className={cn(className, animate && "entry-stagger")} {...rest}>
      {children}
    </div>
  );
}

function TabsView({ sections, tablistLabel }) {
  const [active, setActive] = useState(sections[0].key);
  const baseId = useId();
  const activeSection = sections.find((s) => s.key === active) ?? sections[0];
  const [seen] = useState(() => new Set());

  return (
    <div>
      <div
        className="flex gap-1 overflow-x-auto border-b border-border-soft"
        role="tablist"
        aria-label={tablistLabel}
      >
        {sections.map(({ key, label, icon }) => {
          const Icon = icon;
          const selected = key === active;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${key}`}
              tabIndex={selected ? 0 : -1}
              className={cn("inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-4 py-3 font-inherit text-sm font-semibold whitespace-nowrap text-text-muted transition-[color,border-color] duration-200 hover:text-text-body", selected && "border-b-brand-500 text-brand-600")}
              onClick={() => setActive(key)}
            >
              <Icon size={17} strokeWidth={2} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <AnimatedPanel
        key={active}
        sectionKey={active}
        seenSet={seen}
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        className="pt-5"
      >
        {activeSection.panel}
      </AnimatedPanel>
    </div>
  );
}

function AccordionView({ sections }) {
  const [open, setOpen] = useState(sections[0].key);
  const baseId = useId();
  const [seen] = useState(() => new Set());

  return (
    <div className="flex flex-col gap-3">
      {sections.map(({ key, label, icon, panel }) => {
        const Icon = icon;
        const expanded = key === open;
        return (
          <div key={key} className="overflow-hidden rounded-lg border border-border-soft bg-card shadow-sm">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 font-inherit"
              aria-expanded={expanded}
              aria-controls={`${baseId}-acc-${key}`}
              onClick={() => setOpen(expanded ? null : key)}
            >
              <span className="inline-flex items-center gap-3 text-sm font-semibold text-text-main [&_svg]:text-brand-600">
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                {label}
              </span>
              <ChevronDown
                size={18}
                strokeWidth={2}
                className={cn(
                  "text-text-muted transition-transform duration-250 motion-reduce:transition-none",
                  expanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {expanded && (
              <AnimatedPanel
                sectionKey={key}
                seenSet={seen}
                id={`${baseId}-acc-${key}`}
                className="px-5 pb-5"
              >
                {panel}
              </AnimatedPanel>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Sections come in already built by the caller, so the labels, the panels and
// their i18n namespace stay with the role that owns them.
export function ProfileSectionsView({ sections, tablistLabel }) {
  const isDesktop = useMediaQuery("(min-width: 64em)");
  return isDesktop ? (
    <TabsView sections={sections} tablistLabel={tablistLabel} />
  ) : (
    <AccordionView sections={sections} />
  );
}

export default ProfileSectionsView;
