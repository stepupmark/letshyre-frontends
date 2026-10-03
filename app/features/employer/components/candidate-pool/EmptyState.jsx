import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center rounded-lg border border-dashed border-brand-200 bg-card px-6 py-14 text-center" role="status">
    <div className="mb-4 flex size-18 items-center justify-center rounded-full bg-brand-100 text-brand-500" aria-hidden="true">
      {icon ? React.createElement(icon, { size: 48 }) : <Inbox size={48} />}
    </div>
    <h3 className="mt-0 mb-2 text-lg font-semibold text-text-body">{title}</h3>
    <p className="m-0 max-w-[44ch] text-sm leading-relaxed text-neutral-500">{description}</p>
    {actionLabel && onAction && (
      <Button
        className="mt-5 h-auto gap-1.5 rounded-full bg-brand-600 px-4.5 py-2.25 text-sm font-semibold text-white hover:bg-brand-700"
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </Button>
    )}
  </div>
);
