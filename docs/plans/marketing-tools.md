# Marketing tools: catalogue and roadmap

Status: proposal, nothing built. Phases 1 and 2 run in the browser on the marketing site with no API.
Phase 3 needs the dashboard app or a backend.

## Ground rules for every tool

- **Its own page:** `/tools/<slug>`, listed on a `/tools` hub grouped "For professionals" and "For
  employers".
- **Page layout:** header, calculator, result with breakdown, "How we work it out", assumptions,
  FAQ, related tools and posts, CTA.
- **Indian rules and formats:** rupees in lakh and crore, the current tax year's slabs, and the
  Labour Codes in force since 21 Nov 2025.
- **Honest about limits:** each tool states what it assumes and that company policy or a tax
  advisor decides.

### Fit with the codebase

- Register each page in `app/lib/pages.ts`, which drives readiness, sitemap and hreflang.
- Add an entry for each page to `LLMS_SECTIONS` in `scripts/llms.ts`.
- Update `docs/baseline/url-contract.md` with the new URLs.
- Move the maths in `features/blog/lib/tools.ts`, the fields in `tool-frame.tsx` and `use-rupees`
  into shared `app/lib`, `app/components` and `app/hooks`. Features can't import each other, and
  both the blog and the tool pages need them.
- Ship English first in a `tools` namespace, the way the audience pages do.
- A "Tools" header or footer link means a new `common.json` key in all 19 locales. Common is a
  layout namespace, so a missing key unpublishes every page in that locale.

## Phase 1: core tools

### For professionals

**1. Take-home salary calculator (CTC → in-hand)**

- **Why:** CTC hides employer PF, gratuity and variable pay; "what will I get?" is the most-searched
  salary question in India.
- **How:** CTC, variable %, basic %, optional state for professional tax. Remove employer PF (12% of
  basic) and gratuity (4.81%), then employee PF, professional tax, and new-regime tax with the rebate
  and cess.
- **Outcome:** monthly and yearly in-hand pay, variable after tax, line-by-line breakdown.

**2. Salary hike calculator**

- **Why:** a 30% CTC hike can be an 18% in-hand hike, so people negotiate on the wrong number.
- **How:** current CTC, offered CTC and variable %, run through the take-home maths. Reverse mode:
  the CTC needed for X% more in hand.
- **Outcome:** CTC hike %, in-hand hike %, extra per month, the CTC to ask for.

**3. Offer comparison (up to 3 offers)**

- **Why:** joining bonuses, variable pay and commute make offers hard to compare.
- **How:** per offer: CTC, variable %, joining bonus, monthly commute cost. Year-one and year-two cash
  after tax, with the bonus taxed on top of the year's income.
- **Outcome:** side-by-side table, the best offer in year one and in year two, the gap in rupees.

**4. Notice period and buyout calculator**

- **Why:** 60–90 day notice periods are standard, and the buyout decides whether a joining date
  works.
- **How:** resignation date, notice days, monthly pay (basic or gross per company policy), target
  join date, optional leave set-off. Calendar days; a day is monthly pay ÷ 30.
- **Outcome:** last working day, unserved days, buyout amount, latest date to resign for a given join
  date.

**5. Gratuity calculator**

- **Why:** high search volume, and the 2025 Labour Codes made many existing calculators wrong.
- **How:**
  - Inputs: monthly basic + DA, total monthly pay, join and leave dates, permanent or fixed-term.
  - Wage base is at least 50% of total pay.
  - Amount is 15/26 × wage × years.
  - Permanent staff qualify after 5 years; a part-year over 6 months counts as a full year.
  - Fixed-term staff qualify after 1 year, paid pro rata.
- **Outcome:** eligibility, years counted, gratuity amount, tax-free part (up to ₹20 lakh).

**6. Full and final settlement estimator**

- **Why:** every leaver gets one and few understand it. The Code on Wages requires settlement within
  2 working days.
- **How:** pay for days worked in the last month + leave encashment (basic ÷ 30 × days) + gratuity
  (tool 5) + bonus due − notice shortfall recovery.
- **Outcome:** an itemised F&F to check the company's statement against.

### For employers

**7. Cost of an open role**

- **Why:** puts a rupee figure on time-to-hire, LetsHyre's core pitch.
- **How:** role CTC, number of openings, current and target days to fill. A day is CTC ÷ 365.
- **Outcome:** cost per day, extra cost at today's speed, saving at target.

**8. Buyout or wait?**

- **Why:** the weekly decision for teams hiring people on notice, which is LetsHyre's niche.
- **How:** offered CTC, the candidate's current monthly pay, notice days left, days to buy out.
  Buyout cost against the cost of the empty seat for those days.
- **Outcome:** both costs, the net saving, break-even days.

**9. Joining date planner**

- **Why:** with 90-day notice periods, hiring must start months earlier than teams expect.
- **How:** target join date, expected notice (30/60/90 days), days from sourcing to offer, days from
  offer to resignation. Worked backwards from the join date.
- **Outcome:** latest offer date, latest search start date, a warning if already late, and a table
  for 30, 60 and 90-day notice.

**10. Hiring funnel and offer dropout planner**

- **Why:** reneging during notice is common in India, so pipelines get under-planned.
- **How:** hires needed and stage rates (screen → interview → offer → accept → join), divided back up
  the funnel.
- **Outcome:** applicants, interviews and offers needed, and the extra offers that cover dropout.

## Phase 2: more browser-only tools

| Tool                                 | Why                                                     | Outcome                                                           |
| ------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------- |
| Counteroffer check (stay vs leave)   | Every resignation triggers one                          | Year-one and year-two cash for each choice, after tax             |
| Joining bonus clawback               | Clawback clauses get signed unread                      | The bonus after tax; payback if leaving at month N                |
| Commute and return-to-office cost    | Hybrid vs office is part of comparing offers            | Hours and rupees a month, workdays lost a year                    |
| Old vs new tax regime                | Asked every year                                        | Which regime is cheaper and by how much; needs deduction inputs   |
| Salary structure checker (employers) | The Labour Codes' 50% wage rule changes PF and gratuity | Flags basic below 50%; the real cost to the employer              |
| Interview device check               | Candidates take spoken AI interviews                    | Mic, camera and network check; must not duplicate the app's check |

## Phase 3: needs the app or a backend

| Tool                                     | Why                                     | Needs                |
| ---------------------------------------- | --------------------------------------- | -------------------- |
| Resume vs job description match          | "Will I get shortlisted?"               | AI, file upload      |
| AI mock interview (practice)             | Lowers anxiety; leads into the product  | The interview engine |
| Job description writer                   | Every hire starts here                  | AI                   |
| Interview question and scorecard builder | Matches LetsHyre's scorecards           | AI, role data        |
| Salary benchmarks by role and city       | Makes the salary tools sharper          | Real pay data only   |
| Notice-period talent search              | Links the tools straight to the product | The dashboard        |

## Add-on features across tools

- **Shareable link:** inputs kept in the URL, so a result can be sent to family or HR.
- **Saved scenarios:** kept in the browser, with side-by-side comparison.
- **Print or PDF summary** of a result.
- **Charts** where they explain something, such as the CTC split or funnel stages.
- **Blog links:** each blog embed links to its full tool page.
- **Contextual CTA:** for example, from Buyout or wait to "Find candidates already serving notice".
- **Indian-language translations first:** hi, ta, te, kn, ml, bn.
- **Structured data:** `WebApplication` and `FAQPage`.
- **Consent-aware analytics:** tool used, result reached, click-through to sign-up.

## Improvements to the existing calculators

- Keep tax slabs in one dated config per financial year, with a yearly update checklist and tests.
- The slabs in `tools.ts` say 2025-26 and are unchanged for FY 2026-27; update the comment.
- Move the maths out of `features/blog` so the blog and the tool pages share one source.
- Test every new rule: gratuity rounding, fixed-term pro rata, the 50% wage base, date edge cases.
- Allow a 26-day month as well as a 30-day month, since company policies differ.
- Check accessibility: results announced to screen readers, keyboard use, Arabic and Urdu layouts.

## Outcomes to measure

- **Traffic:** organic visits to `/tools/*`.
- **Conversion:** sign-ups from tool pages, by employers and by candidates.
- **Engagement:** results reached, links shared, return visits.
- **Positioning:** LetsHyre as the place for notice-period hiring, on both sides.
