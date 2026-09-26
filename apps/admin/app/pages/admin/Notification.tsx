export default function NotificationScheduler() {
  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Notification Scheduler
            </h1>
            <p className="mt-1 text-muted-foreground">
              Schedule and manage notifications for candidates and recruiters.
            </p>
          </div>

          <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-xs transition hover:opacity-90">
            Send Test Notification
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Scheduled",
              value: "124",
            },
            {
              title: "Delivered",
              value: "8,924",
            },
            {
              title: "Processing",
              value: "42",
            },
            {
              title: "Failed",
              value: "12",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border bg-card p-5 shadow-xs"
            >
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="col-span-1 rounded-3xl border border-border bg-card p-6 shadow-xs lg:col-span-7">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Create Notification
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure message details, recipients, and scheduling.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-5 rounded-3xl border border-border p-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Notification Title
                  </label>
                  <input
                    placeholder="Interview Reminder"
                    className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Write your notification message here..."
                    className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Channel
                    </label>
                    <select className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50">
                      <option>Email</option>
                      <option>SMS</option>
                      <option>Push Notification</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Priority
                    </label>
                    <select className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-5 rounded-3xl border border-border p-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Recipients
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose target audience for this notification.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["Candidates", "Recruiters", "Both"].map((type) => (
                    <button
                      key={type}
                      className="rounded-2xl border border-border py-3 text-sm font-medium transition hover:bg-accent"
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Experience
                    </label>
                    <select className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50">
                      <option>All</option>
                      <option>0-2 Years</option>
                      <option>2-5 Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Status
                    </label>
                    <select className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50">
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/50 p-4 text-sm text-foreground">
                  Estimated Recipients:
                  <span className="font-semibold text-foreground">
                    1,248 users
                  </span>
                </div>
              </div>

              <div className="space-y-5 rounded-3xl border border-border p-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Schedule Delivery
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure delivery date and time.
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
                  <input type="radio" defaultChecked />
                  <p className="text-sm font-medium text-foreground">
                    Schedule for Later
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Timezone
                    </label>
                    <select className="w-full rounded-2xl border border-border px-4 py-3 outline-hidden focus:ring-2 focus:ring-ring/50">
                      <option>UTC</option>
                      <option>Asia/Kolkata</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="rounded-2xl border border-border px-6 py-3 text-sm font-semibold transition hover:bg-accent">
                  Save Draft
                </button>

                <button className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                  Schedule Notification
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Live Preview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Preview before sending.
                  </p>
                </div>

                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Email
                </span>
              </div>

              <div className="rounded-3xl border border-border bg-muted/50 p-5">
                <p className="text-sm text-muted-foreground">Subject</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  Interview Reminder
                </h3>

                <div className="mt-5 space-y-3 text-sm text-foreground">
                  <p>Hello Candidate,</p>

                  <p>
                    This is a reminder regarding your upcoming AI interview.
                    Please ensure your camera and microphone are working before
                    joining.
                  </p>

                  <p>Thank you.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Notifications
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Latest notification delivery activities.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Interview Reminder",
                    status: "Scheduled",
                  },
                  {
                    title: "Resume Unlock Alert",
                    status: "Delivered",
                  },
                  {
                    title: "Subscription Expiry",
                    status: "Failed",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        09 May 2026 • 06:14 PM
                      </p>
                    </div>

                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
