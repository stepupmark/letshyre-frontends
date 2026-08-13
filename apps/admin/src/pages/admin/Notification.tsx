export default function NotificationScheduler() {
  return (
    <div className="min-h-screen p-8 bg-neutral-100">
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              Notification Scheduler
            </h1>
            <p className="mt-1 text-neutral-500">
              Schedule and manage notifications for candidates and recruiters.
            </p>
          </div>

          <button className="px-5 py-3 text-sm font-semibold text-white transition bg-black shadow-sm rounded-2xl hover:opacity-90">
            Send Test Notification
          </button>
        </div>

        {/* Top Stats */}
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
              className="p-5 bg-white border shadow-sm rounded-3xl border-neutral-200"
            >
              <p className="text-sm text-neutral-500">{item.title}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Form Section */}
          <div className="col-span-1 p-6 bg-white border shadow-sm rounded-3xl border-neutral-200 lg:col-span-7">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Create Notification
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Configure message details, recipients, and scheduling.
              </p>
            </div>

            <div className="space-y-6">
              {/* Message Details */}
              <div className="p-5 space-y-5 border rounded-3xl border-neutral-200">
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Notification Title
                  </label>
                  <input
                    placeholder="Interview Reminder"
                    className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Write your notification message here..."
                    className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Channel
                    </label>
                    <select className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black">
                      <option>Email</option>
                      <option>SMS</option>
                      <option>Push Notification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Priority
                    </label>
                    <select className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="p-5 space-y-5 border rounded-3xl border-neutral-200">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Recipients
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Choose target audience for this notification.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["Candidates", "Recruiters", "Both"].map((type) => (
                    <button
                      key={type}
                      className="py-3 text-sm font-medium transition border rounded-2xl border-neutral-200 hover:bg-neutral-100"
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Experience
                    </label>
                    <select className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black">
                      <option>All</option>
                      <option>0-2 Years</option>
                      <option>2-5 Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Status
                    </label>
                    <select className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black">
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 text-sm rounded-2xl bg-neutral-50 text-neutral-700">
                  Estimated Recipients:
                  <span className="font-semibold text-neutral-900">
                    1,248 users
                  </span>
                </div>
              </div>

              {/* Scheduling */}
              <div className="p-5 space-y-5 border rounded-3xl border-neutral-200">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Schedule Delivery
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Configure delivery date and time.
                  </p>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-2xl border-neutral-200">
                  <input type="radio" defaultChecked />
                  <p className="text-sm font-medium text-neutral-800">
                    Schedule for Later
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-700">
                      Timezone
                    </label>
                    <select className="w-full px-4 py-3 border outline-none rounded-2xl border-neutral-200 focus:ring-2 focus:ring-black">
                      <option>UTC</option>
                      <option>Asia/Kolkata</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="px-6 py-3 text-sm font-semibold transition border rounded-2xl border-neutral-200 hover:bg-neutral-100">
                  Save Draft
                </button>

                <button className="px-6 py-3 text-sm font-semibold text-white transition bg-black rounded-2xl hover:opacity-90">
                  Schedule Notification
                </button>
              </div>
            </div>
          </div>

          {/* Preview + Activity */}
          <div className="col-span-1 space-y-6 lg:col-span-5">
            {/* Live Preview */}
            <div className="p-6 bg-white border shadow-sm rounded-3xl border-neutral-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Live Preview
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Preview before sending.
                  </p>
                </div>

                <span className="px-3 py-1 text-xs font-medium text-white bg-black rounded-full">
                  Email
                </span>
              </div>

              <div className="p-5 border rounded-3xl border-neutral-200 bg-neutral-50">
                <p className="text-sm text-neutral-500">Subject</p>
                <h3 className="mt-1 text-lg font-semibold text-neutral-900">
                  Interview Reminder
                </h3>

                <div className="mt-5 space-y-3 text-sm text-neutral-700">
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

            {/* Recent Notifications */}
            <div className="p-6 bg-white border shadow-sm rounded-3xl border-neutral-200">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Recent Notifications
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
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
                    className="flex items-center justify-between p-4 border rounded-2xl border-neutral-200"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        09 May 2026 • 06:14 PM
                      </p>
                    </div>

                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
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
