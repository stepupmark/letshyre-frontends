import type { AnchorHTMLAttributes, ReactNode } from "react";
import { safeExternalUrl } from "~/lib/safe-url";

type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> & {
  href: string | null | undefined;
  fallback?: ReactNode;
};

export function ExternalLink({ href, fallback = null, children, ...props }: ExternalLinkProps) {
  const url = safeExternalUrl(href);
  if (!url) return <>{fallback}</>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}
