import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { DetailList } from "~/components/detail-list";
import { EmptyState } from "~/components/feedback/empty-state";
import { ErrorState } from "~/components/feedback/error-state";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  CompanyAvatar,
  CompanyKycDetails,
  KycStatusBadge,
} from "~/features/kyc";
import { Copyable } from "~/components/copyable";
import { formatDate, formatNumber } from "~/lib/format";
import { employersQueries } from "../queries/employers.queries";

export function EmployerProfilePage() {
  const { id = "" } = useParams();
  const employer = useQuery(employersQueries.detail(id));

  const back = (
    <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
      <Link to="/dashboard/employers">
        <ArrowLeft /> Employers
      </Link>
    </Button>
  );

  if (employer.isError)
    return (
      <>
        {back}
        <ErrorState
          error={employer.error}
          onRetry={() => void employer.refetch()}
        />
      </>
    );

  if (!employer.data)
    return (
      <>
        {back}
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );

  const data = employer.data;
  const kyc = data.employer_kyc;

  return (
    <>
      {back}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CompanyAvatar
            name={kyc?.company_name ?? data.user_name}
            logo={kyc?.company_logo}
            className="size-14"
          />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              {kyc?.company_name || data.user_name || "Employer"}
              <KycStatusBadge status={kyc?.kyc_status} />
            </h1>
            <p className="text-sm text-muted-foreground">
              {kyc?.created_at
                ? `KYC submitted ${formatDate(kyc.created_at)}`
                : "KYC not submitted yet"}
            </p>
          </div>
        </div>
        {kyc && kyc.kyc_status !== "Verified" && (
          <Button variant="outline" asChild>
            <Link to={`/dashboard/kyc/${kyc.id}`}>Review KYC</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid gap-4 xl:col-span-2">
          {kyc ? (
            <CompanyKycDetails kyc={kyc} />
          ) : (
            <Card>
              <CardContent>
                <EmptyState
                  title="No company details"
                  description="This employer hasn't completed KYC."
                />
              </CardContent>
            </Card>
          )}
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Name", value: data.user_name },
                {
                  label: "Email",
                  value: <Copyable value={data.email} label="Email" />,
                },
                {
                  label: "Phone",
                  value: (
                    <Copyable value={data.phone_number} label="Phone number" />
                  ),
                },
                { label: "Role", value: data.role },
                { label: "Job posts", value: formatNumber(data.job_posts) },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
