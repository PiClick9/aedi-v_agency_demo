# AGENCY PILOT signup → registration API

## Goal

Wire the AGENCY PILOT signup form to the real registration API. On success the
API returns a personalised invite link (with a `registCode`); that link
replaces the hardcoded URL on the INCLUDES screen.

## API

- Host (US only for now): `https://global.aedi.ai`
- Endpoint: `POST /aediv/simple_registration`
- Body (JSON, per the documented spec):
  ```json
  { "name": "test", "bizName": "MCN Test", "email": "test@test.com", "position": "" }
  ```
- Success response:
  ```json
  { "status": "S", "msg": "Success", "u_idx": 7044,
    "link": "https://chromewebstore.google.com/detail/...?registCode=..." }
  ```
- Failure cases are undefined by the API team; treated generically (see below).

## Decisions

- **Real integration only** — no mock/fallback. Each submit creates a real
  registration.
- **Errors** reuse the existing `SuccessModal` component to show a message
  (server `msg` if present, else a default).
- **Position** stays optional; sent as `""` when blank.
- Field mapping: Company Name→`bizName`, Name→`name`, Email→`email`,
  Position→`position`.

## Design

### API client — `src/api/registration.ts`
- `API_BASE = 'https://global.aedi.ai'` (single constant; region-ready later).
- `registerAgency({ name, bizName, email, position }): Promise<{ link, uIdx }>`
  - `POST ${API_BASE}/aediv/simple_registration`, `Content-Type: application/json`.
  - `status === 'S'` → resolve `{ link, uIdx }`; otherwise throw `Error(msg || default)`.
  - Network/CORS/parse failures throw with a friendly message.
- Typed request/response shapes.

### `SignupPage`
- After the email check: `submitting = true`, SAVE disabled + label "Saving…"
  (blocks double-submit).
- Read fields via `FormData`; map to the API body.
- Success → "Saved successfully" modal → OK → `navigate('/includes', { state: { link } })`.
- Failure → `SuccessModal` with the error message → OK stays on the form.

### `IncludesPage`
- Read `link` from `useLocation().state`; use it for the Copy link input/copy.
- No state (direct visit / refresh — HashRouter drops state) → redirect to `/`.

### Data flow
```
submit → registerAgency() → {link} → "Saved successfully" → OK
  → /includes (state.link) → Copy link shows the real link
failure → error modal → OK → stay on form
```

## Verification

Real calls are CORS-blocked and create registrations, so no live E2E. Instead a
Playwright test with request interception asserts:
1. the request is `POST .../aediv/simple_registration` with the mapped JSON body,
2. a mocked `status:"S"` response carries its `link` to INCLUDES,
3. a mocked failure shows the error modal and stays on the form.
Plus build + typecheck.

## Open items (confirm with API team; not blocking)

1. **CORS** — the API sends no `Access-Control-Allow-Origin`, so the deployed
   github.io demo will fail (error modal) until the API adds it. Code is ready
   for when it does.
2. **JSON vs form-encoded** — the server is CodeIgniter (PHP). We send JSON per
   the documented spec; confirm the endpoint parses a JSON body (else switch to
   `application/x-www-form-urlencoded`, a one-line change).
