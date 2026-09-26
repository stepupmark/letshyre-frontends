import { useParams, Link, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useCandidateProfile } from "../../hooks/useCandidates";
import { ArrowDownToLine, ChevronLeft } from "lucide-react";
import CandidateProfileSkeleton from "../../components/Skeletons/CandidateProfileSkeleton";
import CandidateApprovalActions from "../../components/admin/CandidateApprovalActions";

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-600",
];

function avatarGradient(name: string | null | undefined) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmtDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtMonthYear(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(start?: string | null, end?: string | null) {
  return `${fmtMonthYear(start)} - ${end ? fmtMonthYear(end) : "Present"}`;
}

function fmtCTC(val?: number | null) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 1,
  }).format(val);
}

function openFile(url?: string | null) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border shadow-xs rounded-2xl">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-bold tracking-wide text-foreground uppercase">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm italic text-muted-foreground">{text}</p>;
}

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: c, isLoading, isError } = useCandidateProfile(id || "");

  if (isLoading) return <CandidateProfileSkeleton />;

  if (isError || !c) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Failed to load candidate profile.</p>
        <Link to="/dashboard/candidates" className="text-primary">
          Go Back
        </Link>
      </div>
    );
  }

  const grad = avatarGradient(c.name);

  return (
    <>
      <PageMeta
        title={`${c.name} - Candidate`}
        description={`Candidate profile of ${c.name}`}
      />

      <div className="space-y-5 bg-muted/50">
        <div className="flex items-center gap-3 text-sm font-medium">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft size={18} />
            <span>Candidates</span>
          </button>
          <span className="text-muted-foreground/70">/</span>
          <span className="text-primary">Candidate Details</span>
        </div>

        <div className="overflow-hidden bg-card border border-border shadow-xs rounded-2xl">
          <div className={`h-1.5 bg-linear-to-r ${grad}`} />

          <div className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 overflow-hidden bg-muted rounded-2xl">
                  {c.profile_photo ? (
                    <img
                      src={c.profile_photo}
                      alt={c.name}
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                </div>

                {c.resume_url && (
                  <button
                    onClick={() => openFile(c.resume_url)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold border rounded-xl border-violet-200 bg-violet-50 text-violet-700"
                  >
                    <ArrowDownToLine size={14} />
                    Resume
                  </button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-2xl font-extrabold text-foreground">
                    {c.name}
                  </h1>
                  <CandidateApprovalActions
                    profileId={c.id}
                    isApproved={c.is_approved}
                    isRejected={c.is_rejected}
                  />
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {c.preferred_industry}
                </p>

                <div className="grid gap-3 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Email" value={c.email} />
                  <Field label="Phone" value={c.phone_number} />
                  <Field label="Gender" value={c.gender} />
                  <Field label="Location" value={c.location} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="DOB" value={fmtDate(c.dob)} />
              <Field label="Address" value={c.address} />
              <Field label="Role" value={c.role} />
              <Field
                label="Last Working Company"
                value={c.present_or_last_working_company}
              />
              <Field
                label="Last Working Day"
                value={fmtDate(c.last_day_of_working)}
              />
              <Field label="Aadhar" value={c.aadhar_number} />
            </div>
          </Card>

          <Card title="Job Preferences">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Current CTC"
                value={fmtCTC(c.current_ctc) + " LPA"}
              />
              <Field
                label="Expected CTC"
                value={fmtCTC(c.expected_ctc) + "LPA"}
              />
              <Field label="Notice Period" value={`${c.notice_period} Days`} />
              <Field label="Proof Type" value={c.notice_period_prof_type} />
              <Field
                label="Preferred Locations"
                value={c.preferred_locations?.join(", ")}
              />
            </div>
          </Card>
        </div>

        <Card title="Skills">
          {c.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {c.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <EmptyState text="No skills added." />
          )}
        </Card>

        <Card title="Education">
          {c.education?.length ? (
            <div className="space-y-4">
              {c.education.map((e, i) => (
                <div
                  key={i}
                  className="p-5 transition-all duration-200 bg-card border border-border shadow-xs rounded-2xl hover:border-input hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground">
                        {e.degree || e.level || "--"}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        {e.institution || "--"}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {e.start_year || "--"} - {e.end_year || "Present"}
                        </span>

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                          {e.field || e.stream || "Not specified"}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-3 text-center border shrink-0 rounded-2xl border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Score
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {e.percentage ? `${e.percentage}%` : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No education found." />
          )}
        </Card>

        <Card title="Work Experience">
          {c.experience?.length ? (
            <div className="space-y-3">
              {c.experience.map((ex, i) => (
                <div
                  key={i}
                  className="p-4 border border-border rounded-xl bg-muted/50"
                >
                  <p className="font-semibold text-foreground">{ex.role}</p>

                  <p className="text-sm text-muted-foreground">{ex.company}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateRange(ex.start_date, ex.end_date)}
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">{ex.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No experience added." />
          )}
        </Card>

        <Card title="Projects">
          {c.projects?.length ? (
            <div className="space-y-3">
              {c.projects.map((p, i) => (
                <div
                  key={i}
                  className="p-4 border border-border rounded-xl bg-muted/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-semibold text-foreground">{p.title}</p>

                    {(p.live_url || p.github_url) && (
                      <button
                        onClick={() => openFile(p.live_url || p.github_url)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary"
                      >
                        View
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.tech_stack?.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs font-medium text-muted-foreground bg-card rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No projects added." />
          )}
        </Card>

        <Card title="Documents & Files">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Resume", file: c.resume_url },
              { label: "Notice Period Proof", file: c.notice_period_prof },
              { label: "Resignation Letter", file: c.resignation_letter },
              { label: "Experience Letter", file: c.experience_letter },
              { label: "Present Offer Letter", file: c.present_offer },
            ]
              .filter((x) => x.file)
              .map((item) => (
                <button
                  key={item.label}
                  onClick={() => openFile(item.file)}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium border border-border rounded-xl bg-muted/50 hover:bg-accent"
                >
                  <span>{item.label}</span>
                  <ArrowDownToLine size={16} />
                </button>
              ))}
          </div>
        </Card>

        {c.cover_letter && (
          <Card title="Cover Letter">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {c.cover_letter}
            </p>
          </Card>
        )}

        <div className="p-6 bg-card border border-border shadow-xs rounded-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Registered" value={fmtDate(c.created_at)} />
            <Field label="Updated" value={fmtDate(c.updated_at)} />
          </div>
        </div>
      </div>
    </>
  );
}
