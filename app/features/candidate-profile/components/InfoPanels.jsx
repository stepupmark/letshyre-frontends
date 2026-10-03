import { Wallet, TrendingUp, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/common/Panel";

export function InfoPanel({ heading, children }) {
  return (
    <Panel>
      <h2 className="mt-0 mb-4 text-base font-bold text-text-main">{heading}</h2>
      {children}
    </Panel>
  );
}

// Rows separate themselves with a top border from the second one onwards, so
// the class string has to stay identical across every row in a panel.
export function InfoRow({ icon: Icon, label, value, valueClassName }) {
  return (
    <div className="flex items-start gap-3 py-3 [&+&]:border-t [&+&]:border-border-soft">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="flex flex-col">
        {label && <span className="text-xs text-text-muted">{label}</span>}
        <span className={cn("text-sm font-semibold text-text-main", valueClassName)}>{value}</span>
      </span>
    </div>
  );
}

// Current + Expected CTC — the desktop side-rail beside the sections. Each role
// formats its own figures; the two APIs express CTC differently.
export function CtcCards({ currentLabel, currentValue, expectedLabel, expectedValue }) {
  const rows = [
    { key: "current", icon: Wallet, label: currentLabel, value: currentValue },
    { key: "expected", icon: TrendingUp, label: expectedLabel, value: expectedValue },
  ];
  return (
    <>
      {rows.map(({ key, icon, label, value }) => {
        const Icon = icon;
        return (
          <Panel key={key} className="flex items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600" aria-hidden="true">
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className="flex flex-col">
              <span className="text-xs text-text-muted">{label}</span>
              <span className="text-lg font-bold text-text-main">{value}</span>
            </span>
          </Panel>
        );
      })}
    </>
  );
}

export function PreferredLocationsCard({ heading, locations }) {
  if (!locations.length) return null;
  return (
    <InfoPanel heading={heading}>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {locations.map((loc, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-text-body [&_svg]:shrink-0 [&_svg]:text-brand-600">
            <MapPin size={16} strokeWidth={2} aria-hidden="true" />
            <span className="capitalize">{loc}</span>
          </li>
        ))}
      </ul>
    </InfoPanel>
  );
}
