import {
  FileText,
  ExternalLink,
  GraduationCap,
  FolderGit2,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const EP_CHIP =
  "rounded-full border-transparent bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-700";

// Marks each staggered entry; the container opts in with `.entry-stagger`.
const STAGGER_ITEM = "entry-stagger-item";

export function EmptyState({ message }) {
  return <p className="m-0 py-2 text-sm text-text-muted">{message}</p>;
}

// `data-ep-pill` lets the timeline-head parent cancel this pill's top margin
// (utilities can't target a child by class).
function DurationPill({ children }) {
  if (!children) return null;
  return (
    <span className="mt-2 inline-flex w-fit items-center gap-1.25 rounded-full bg-brand-100 px-2.5 py-0.75 text-xs font-semibold text-brand-700 [&_svg]:text-brand-500" data-ep-pill="">
      <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
      {children}
    </span>
  );
}

export function EntryCard({ icon: Icon, title, subtitle, description, pill }) {
  return (
    <div className={cn("group flex items-start gap-4", STAGGER_ITEM)}>
      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600 transition-[background-color,color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:bg-brand-500 group-hover:text-text-white motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" aria-hidden="true">
        <Icon size={20} strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-col">
        <h3 className="m-0 text-base font-bold tracking-tight text-text-main transition-colors duration-200 group-hover:text-brand-700 motion-reduce:transition-none">
          {title}
        </h3>
        {subtitle && <p className="mt-1 mb-0 text-sm font-medium text-brand-700">{subtitle}</p>}
        {description && (
          <p className="mt-2 mb-0 max-w-prose text-sm leading-relaxed text-text-body">{description}</p>
        )}
        <DurationPill>{pill}</DurationPill>
      </div>
    </div>
  );
}

export function EntryList({ children }) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

export function EducationPanel({ items, emptyMessage, fallbackInstitution }) {
  if (!items.length) return <EmptyState message={emptyMessage} />;
  return (
    <EntryList>
      {items.map((edu, i) => (
        <EntryCard
          key={i}
          icon={GraduationCap}
          title={edu.institution || fallbackInstitution}
          subtitle={edu.degree}
          pill={edu.duration}
        />
      ))}
    </EntryList>
  );
}

export function SkillsPanel({ items, emptyMessage }) {
  if (!items.length) return <EmptyState message={emptyMessage} />;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((skill, i) => (
        <Badge key={i} className={EP_CHIP}>
          {skill}
        </Badge>
      ))}
    </div>
  );
}

export function ProjectsPanel({ items, emptyMessage, fallbackTitle }) {
  if (!items.length) return <EmptyState message={emptyMessage} />;
  return (
    <EntryList>
      {items.map((proj, i) => (
        <EntryCard
          key={i}
          icon={FolderGit2}
          title={proj.title || proj.name || fallbackTitle}
          description={proj.description}
        />
      ))}
    </EntryList>
  );
}

export function ExperiencePanel({ items, emptyMessage, fallbackRole }) {
  if (!items.length) return <EmptyState message={emptyMessage} />;
  return (
    <div className="ms-1.25 flex flex-col gap-6 border-s-2 border-border-soft ps-6">
      {items.map((exp, i) => (
        <div key={i} className={cn("group relative before:absolute before:top-1.5 before:-start-7.5 before:size-2.75 before:rounded-full before:bg-brand-500 before:shadow-[0_0_0_4px_var(--color-brand-100)] before:transition-transform before:duration-200 hover:before:scale-125 motion-reduce:before:transition-none motion-reduce:hover:before:scale-100", STAGGER_ITEM)}>
          <div className="flex flex-wrap items-center justify-between gap-3 [&_[data-ep-pill]]:mt-0 [&_[data-ep-pill]]:shrink-0">
            <h3 className="m-0 text-base font-bold tracking-tight text-text-main transition-colors duration-200 group-hover:text-brand-700 motion-reduce:transition-none">{exp.role || fallbackRole}</h3>
            <DurationPill>{exp.duration}</DurationPill>
          </div>
          {exp.company && <p className="mt-1 mb-0 text-sm font-medium text-brand-700">{exp.company}</p>}
          {exp.description && (
            <p className="mt-2 mb-0 max-w-prose text-sm leading-relaxed text-text-body">{exp.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function DocLink({ href, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-md border border-border-soft px-4 py-3 text-text-body transition-[border-color,background-color] duration-200 hover:border-brand-300 hover:bg-brand-100"
    >
      <span className="inline-flex text-brand-600" aria-hidden="true">
        <FileText size={18} strokeWidth={2} />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ExternalLink
        size={15}
        strokeWidth={2}
        className="text-text-faint"
        aria-hidden="true"
      />
    </a>
  );
}

// Callers assemble their own document list; the two roles surface different
// documents from the same record.
export function DocumentsPanel({ docs, emptyMessage }) {
  const present = docs.filter((d) => d.href);
  if (!present.length) return <EmptyState message={emptyMessage} />;
  return (
    <div className="flex flex-col gap-3">
      {present.map((d) => (
        <DocLink key={d.label} href={d.href} label={d.label} />
      ))}
    </div>
  );
}
