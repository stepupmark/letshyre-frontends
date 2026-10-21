// Shapes follow the API responses; names and numbers are made up.

export const dashboard = {
  active_jobs: 4,
  in_active_jobs: 2,
  total_applications: 128,
  credits: { available: 6, used_this_month: 14, monthly: 20 },
}

export const UNLOCK_COST = 2

export const jobs = [
  {
    id: 41,
    title: "Senior React Developer",
    location: "Bengaluru · Hybrid",
    applicants: 48,
    newApplicants: 12,
    closesInDays: 9,
  },
  {
    id: 42,
    title: "Product Designer",
    location: "Remote",
    applicants: 31,
    newApplicants: 4,
    closesInDays: 2,
  },
  {
    id: 43,
    title: "Data Analyst",
    location: "Pune · On-site",
    applicants: 22,
    newApplicants: 0,
    closesInDays: 18,
  },
  {
    id: 44,
    title: "Customer Success Lead",
    location: "Mumbai · Hybrid",
    applicants: 27,
    newApplicants: 3,
    closesInDays: 25,
  },
]

export type ApplicantStatus = "new" | "shortlisted" | "rejected"

export interface Applicant {
  id: number
  name: string
  role_applied: string
  created_at: string
  status: ApplicantStatus
  unlocked: boolean
  ai_match: {
    ai_matching_score: number
    years_experience: number
    rationale: string
    matched_skills: string[]
    missing_skills: string[]
  }
}

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString()

export const applicants: Applicant[] = [
  {
    id: 1,
    name: "Prathyusha",
    role_applied: "Frontend Engineer at Finlytics",
    created_at: daysAgo(0.2),
    status: "new",
    unlocked: true,
    ai_match: {
      ai_matching_score: 86,
      years_experience: 6,
      rationale:
        "Led a React 19 migration and owns a design system used by four teams. Interview answers on state management were specific and correct.",
      matched_skills: ["React", "TypeScript", "Testing", "Accessibility"],
      missing_skills: ["GraphQL"],
    },
  },
  {
    id: 2,
    name: "Rohan Mehta",
    role_applied: "Full-stack Developer at Quickcart",
    created_at: daysAgo(0.6),
    status: "new",
    unlocked: false,
    ai_match: {
      ai_matching_score: 74,
      years_experience: 4,
      rationale:
        "Strong React and Node experience. Less depth on performance work; one answer about rendering was partly wrong.",
      matched_skills: ["React", "TypeScript", "Node.js"],
      missing_skills: ["Testing", "Accessibility"],
    },
  },
  {
    id: 3,
    name: "Fatima Sheikh",
    role_applied: "UI Engineer at Bloom Health",
    created_at: daysAgo(1),
    status: "shortlisted",
    unlocked: true,
    ai_match: {
      ai_matching_score: 81,
      years_experience: 5,
      rationale:
        "Built accessible component libraries in a regulated domain. Clear explanations of trade-offs.",
      matched_skills: ["React", "Accessibility", "Testing", "CSS"],
      missing_skills: ["Next.js"],
    },
  },
  {
    id: 4,
    name: "Karthik Iyer",
    role_applied: "Software Engineer at Zentrix",
    created_at: daysAgo(1.4),
    status: "new",
    unlocked: false,
    ai_match: {
      ai_matching_score: 58,
      years_experience: 3,
      rationale:
        "Mostly Angular experience; React exposure through side projects. Good fundamentals.",
      matched_skills: ["TypeScript", "Testing"],
      missing_skills: ["React", "Accessibility"],
    },
  },
  {
    id: 5,
    name: "Meera Krishnan",
    role_applied: "Frontend Developer at Paystack India",
    created_at: daysAgo(2),
    status: "new",
    unlocked: false,
    ai_match: {
      ai_matching_score: 69,
      years_experience: 7,
      rationale:
        "Senior by years, mostly jQuery and Vue. Answers were thorough but not React-specific.",
      matched_skills: ["TypeScript", "CSS", "Testing"],
      missing_skills: ["React"],
    },
  },
  {
    id: 6,
    name: "Arjun Nair",
    role_applied: "Junior Developer at Codecraft",
    created_at: daysAgo(3),
    status: "rejected",
    unlocked: false,
    ai_match: {
      ai_matching_score: 34,
      years_experience: 1,
      rationale:
        "Early career. Did not complete the technical questions in the interview.",
      matched_skills: ["React"],
      missing_skills: ["TypeScript", "Testing", "Accessibility"],
    },
  },
  {
    id: 7,
    name: "Sneha Pillai",
    role_applied: "React Native Developer at Moveo",
    created_at: daysAgo(3.5),
    status: "new",
    unlocked: false,
    ai_match: {
      ai_matching_score: 77,
      years_experience: 5,
      rationale:
        "Mobile-first React work with a shared web codebase. Solid testing habits.",
      matched_skills: ["React", "TypeScript", "Testing"],
      missing_skills: ["Accessibility"],
    },
  },
  {
    id: 8,
    name: "Vikram Singh",
    role_applied: "Frontend Lead at Orbit Labs",
    created_at: daysAgo(4),
    status: "shortlisted",
    unlocked: true,
    ai_match: {
      ai_matching_score: 91,
      years_experience: 9,
      rationale:
        "Leads a team of six, shipped a large design-system rollout. Best answers in this applicant pool on architecture.",
      matched_skills: ["React", "TypeScript", "Testing", "Accessibility"],
      missing_skills: [],
    },
  },
]

export const scorecard = {
  candidate_name: "Prathyusha",
  candidate_role: "Senior React Developer",
  overall_score: 82,
  created_at: daysAgo(2),
  duration_minutes: 24,
  summary:
    "Clear, specific answers on React rendering and state. Explained trade-offs without prompting. Weaker on GraphQL, which the role lists as nice to have.",
  candidate_skills: [
    { name: "React", evidence: 4 },
    { name: "TypeScript", evidence: 3 },
    { name: "Testing", evidence: 2 },
    { name: "Accessibility", evidence: 2 },
    { name: "System design", evidence: 1 },
  ],
  comm_metrics: [
    { key: "clarity", label: "Clarity", value: 86 },
    { key: "relevance", label: "Relevance", value: 88 },
    { key: "confidence", label: "Confidence", value: 74 },
    { key: "depth", label: "Depth of thought", value: 79 },
    { key: "coverage", label: "Key concepts covered", value: 69 },
  ],
  questions: [
    {
      type: "Technical",
      at: "02:10",
      score: 9,
      question:
        "How would you stop a large list from re-rendering when one item changes?",
      answer:
        "Keep item identity stable with keys from the data, memoise the row component, and move the changing state down into the row so the parent doesn't re-render. If the list is long I'd virtualise it.",
      feedback:
        "Correct and complete. Mentioned virtualisation without being asked.",
    },
    {
      type: "Technical",
      at: "06:45",
      score: 8,
      question: "When would you reach for a reducer instead of useState?",
      answer:
        "When the next state depends on the previous one in several ways, or when several values change together. It also makes the transitions testable on their own.",
      feedback: "Good reasoning; could have mentioned useActionState.",
    },
    {
      type: "Behavioural",
      at: "11:30",
      score: 8,
      question: "Tell us about a time you disagreed with a design decision.",
      answer:
        "A designer wanted a custom dropdown. I showed the accessibility gaps with a screen reader, and we kept the native select on mobile and a tested component on desktop.",
      feedback: "Specific situation, clear outcome, respectful framing.",
    },
    {
      type: "Technical",
      at: "17:05",
      score: 5,
      question: "How would you design the data layer for a GraphQL API?",
      answer:
        "I haven't used GraphQL in production. I'd look at a client with a normalised cache so the same entity isn't fetched twice.",
      feedback:
        "Honest about the gap; the idea is right but there are no specifics.",
    },
  ],
}
