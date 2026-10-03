# @workspace/api

`fetch` client for the LetsHyre API, plus the public endpoints the marketing site calls.

```ts
import { createHttpClient } from "@workspace/api"
import { getPublicPlans } from "@workspace/api/public"

const api = createHttpClient({ baseUrl: env.VITE_API_BASE_URL })
const plans = await getPublicPlans(api, { signal })
```

- 15 s timeout per attempt. GETs retry twice with backoff on network errors, timeouts, 429 and 5xx. POSTs never retry.
- Every failure is an `ApiError`: `NetworkError`, `TimeoutError`, `HttpError` (`status`, `code`, `backendMessage`) or `ResponseShapeError`.
- Responses use the `{ success, data, message }` envelope. `unwrap(schema)` returns the parsed `data`; `success: false` throws `HttpError` even on a 200.
- `getAuthHeader` and `onUnauthorized` are for the dashboard app. The public client sets neither, so it never sends a token.

| Function               | Endpoint                                       |
| ---------------------- | ---------------------------------------------- |
| `sendContactMessage`   | `POST /commonapp/v1/contact/`                  |
| `subscribe`            | `POST /commonapp/v1/stay_updated/`             |
| `getPublicPlans`       | `GET /finances/v1/credit_plans/public/`        |
| `getCreditPrice`       | `GET /payment/v1/public/calculate-token-cost/` |
| `getLatestRelease`     | `GET /commonapp/v1/desktop_app/:os/latest/`    |
| `sendAssistantMessage` | `POST /commonapp/v1/chatbot/chat/`             |

Tests mock the API with MSW (`test/server.ts`).
