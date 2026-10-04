# API fixtures

One JSON file per endpoint, named after its path (`/payment/v1/employer_credits/` →
`payment.v1.employer_credits.json`). E2E mocks answer with them and
`app/lib/contracts.test.ts` parses each one with the schema the app uses, so a changed
backend shape fails one clear test.

Files here are hand-written from the legacy app until staging exists (B1). Then replace
them with real responses:

```bash
STAGING_API=https://staging-api.letshyre.ai STAGING_TOKEN=... pnpm --filter app fixtures:capture
```

The script scrubs names, emails, phone numbers and URLs before writing.
