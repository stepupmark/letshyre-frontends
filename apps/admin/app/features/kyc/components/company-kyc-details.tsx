import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { ExternalLink } from "~/components/external-link";
import { SensitiveValue } from "~/components/sensitive-value";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { safeExternalUrl } from "~/lib/safe-url";
import type { CompanyKyc } from "../schemas/kyc.schema";

export function DetailList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-sm break-words">
            {item.value || <span className="text-muted-foreground">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function WebLink({ href }: { href: string | null | undefined }) {
  return (
    <ExternalLink
      href={href}
      className="text-primary underline-offset-4 hover:underline"
      fallback={
        href ? (
          <span className="text-muted-foreground">Invalid link</span>
        ) : null
      }
    >
      {safeExternalUrl(href)
        ?.replace(/^https?:\/\//, "")
        .replace(/\/$/, "")}
    </ExternalLink>
  );
}

export function CompanyKycDetails({ kyc }: { kyc: CompanyKyc }) {
  const documents = [
    { label: "Registration certificate", url: kyc.registration_certificate },
    { label: "GST certificate", url: kyc.gst_certificate },
    { label: "Address proof", url: kyc.address_proof },
    { label: "Authorised ID proof", url: kyc.authorized_id_proof },
    { label: "Bank proof", url: kyc.bank_proof },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
          {kyc.company_description && (
            <CardDescription className="whitespace-pre-line">
              {kyc.company_description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              { label: "Industry", value: kyc.company_industry },
              { label: "Official email", value: kyc.official_email },
              {
                label: "Website",
                value: (
                  <WebLink href={kyc.company_website || kyc.website_url} />
                ),
              },
              { label: "LinkedIn", value: <WebLink href={kyc.linkedin_url} /> },
              { label: "Address", value: kyc.company_address },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
          <CardDescription>
            Hidden by default. Reveal only what you need to verify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              {
                label: "Registration number",
                value: (
                  <SensitiveValue
                    label="registration number"
                    value={kyc.company_registration_number}
                  />
                ),
              },
              {
                label: "GST number",
                value: (
                  <SensitiveValue label="GST number" value={kyc.gst_number} />
                ),
              },
              {
                label: "PAN",
                value: <SensitiveValue label="PAN" value={kyc.pan_number} />,
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {documents.map((doc) => (
            <div
              key={doc.label}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                <FileText className="size-4 text-muted-foreground" />
                {doc.label}
              </span>
              <Button variant="outline" size="sm" asChild>
                <ExternalLink
                  href={doc.url}
                  fallback={
                    <span className="text-xs text-muted-foreground">
                      {doc.url ? "Invalid link" : "Not uploaded"}
                    </span>
                  }
                >
                  View
                </ExternalLink>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
