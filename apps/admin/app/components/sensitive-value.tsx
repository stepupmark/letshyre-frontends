import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { maskId } from "~/lib/format";

/** Masked by default; the admin reveals it on purpose. */
export function SensitiveValue({
  value,
  label,
}: {
  value: string | null | undefined;
  label: string;
}) {
  const [visible, setVisible] = useState(false);
  if (!value) return <span className="text-muted-foreground">—</span>;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono">{visible ? value : maskId(value)}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </span>
  );
}
