// Enough copy to check German length and Arabic RTL; real catalogs come in 5.4.

const en = {
  "nav.hiring": "Hiring",
  "nav.company": "Company",
  "nav.dashboard": "Dashboard",
  "nav.jobs": "Jobs",
  "nav.pool": "Candidate pool",
  "nav.unlocked": "Unlocked candidates",
  "nav.team": "Team",
  "nav.billing": "Billing",
  "nav.search": "Search or jump to…",
  "dashboard.title": "Dashboard",
  "dashboard.summary": "{{count}} things need you today",
  "dashboard.postJob": "Post a job",
  "attention.title": "Needs your attention",
  "jobs.title": "Open jobs",
  "credits.title": "Credits",
  "credits.add": "Add credits",
  "credits.unlocks": "Enough for {{count}} unlocks",
  "setup.title": "Finish setting up",
  "applicants.title": "Applicants",
  "applicants.shortlist": "Shortlist",
  "applicants.reject": "Reject",
  "applicants.selected": "{{count}} selected",
  "scorecard.title": "Interview scorecard",
  "user.signOut": "Sign out",
}

type Copy = Record<keyof typeof en, string>

const de: Copy = {
  "nav.hiring": "Einstellung",
  "nav.company": "Unternehmen",
  "nav.dashboard": "Übersicht",
  "nav.jobs": "Stellenanzeigen",
  "nav.pool": "Kandidatenpool",
  "nav.unlocked": "Freigeschaltete Kandidaten",
  "nav.team": "Team",
  "nav.billing": "Abrechnung",
  "nav.search": "Suchen oder springen zu…",
  "dashboard.title": "Übersicht",
  "dashboard.summary": "{{count}} Aufgaben warten heute auf Sie",
  "dashboard.postJob": "Stellenanzeige veröffentlichen",
  "attention.title": "Braucht Ihre Aufmerksamkeit",
  "jobs.title": "Offene Stellenanzeigen",
  "credits.title": "Guthaben",
  "credits.add": "Guthaben aufladen",
  "credits.unlocks": "Reicht für {{count}} Freischaltungen",
  "setup.title": "Einrichtung abschließen",
  "applicants.title": "Bewerberinnen und Bewerber",
  "applicants.shortlist": "Vormerken",
  "applicants.reject": "Absagen",
  "applicants.selected": "{{count}} ausgewählt",
  "scorecard.title": "Auswertung des Vorstellungsgesprächs",
  "user.signOut": "Abmelden",
}

const ar: Copy = {
  "nav.hiring": "التوظيف",
  "nav.company": "الشركة",
  "nav.dashboard": "لوحة التحكم",
  "nav.jobs": "الوظائف",
  "nav.pool": "مجموعة المرشحين",
  "nav.unlocked": "المرشحون المفتوحون",
  "nav.team": "الفريق",
  "nav.billing": "الفوترة",
  "nav.search": "ابحث أو انتقل إلى…",
  "dashboard.title": "لوحة التحكم",
  "dashboard.summary": "{{count}} أمور تحتاج إليك اليوم",
  "dashboard.postJob": "انشر وظيفة",
  "attention.title": "تحتاج إلى انتباهك",
  "jobs.title": "الوظائف المفتوحة",
  "credits.title": "الأرصدة",
  "credits.add": "أضف أرصدة",
  "credits.unlocks": "تكفي لـ {{count}} عمليات فتح",
  "setup.title": "أكمل الإعداد",
  "applicants.title": "المتقدمون",
  "applicants.shortlist": "أضف إلى القائمة المختصرة",
  "applicants.reject": "ارفض",
  "applicants.selected": "{{count}} محدد",
  "scorecard.title": "تقييم المقابلة",
  "user.signOut": "تسجيل الخروج",
}

export const copy = { en, de, ar }

export type Lang = keyof typeof copy
export type CopyKey = keyof typeof en
