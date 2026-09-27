import { DetailList } from "~/components/detail-list";
import { DocumentList } from "~/components/document-viewer";
import { ExternalLink } from "~/components/external-link";
import { SensitiveValue } from "~/components/sensitive-value";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Copyable } from "~/components/copyable";
import { safeExternalUrl } from "~/lib/safe-url";
import { kycDocuments } from "../documents";
import type { CompanyKyc } from "../schemas/kyc.schema";

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

export function CompanyKycDetails({
  kyc,
  showDocuments = true,
}: {
  kyc: CompanyKyc;
  showDocuments?: boolean;
}) {
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
              {
                label: "Official email",
                value: <Copyable value={kyc.official_email} label="Email" />,
              },
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

      {showDocuments && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={kycDocuments(kyc)}
              className="sm:grid-cols-2"
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
