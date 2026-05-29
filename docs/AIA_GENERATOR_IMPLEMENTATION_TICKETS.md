# AIA Payment Application Generator — Implementation Tickets

**Project:** JBS Construction — Subcontractor Payment Application Tool  
**Branch:** `feature/jbs-subcontractor-portal`  
**Source Plan:** `docs/AIA_G702_G703_GENERATOR_PLAN.md`  
**Date:** May 2026  
**Status:** Ticket Breakdown — Ready for Trello  

---

## Phase Overview

| Phase | Label | Goal |
|---|---|---|
| **Phase 0** | Client Decisions | Resolve blockers before a single line of code is written |
| **Phase 1** | Form UI (No Payment) | Build and validate the multi-step form frontend |
| **Phase 2** | Backend Storage | Database, API endpoints, submission lifecycle |
| **Phase 3** | Stripe Payment | Checkout session, webhook, payment confirmation |
| **Phase 4** | PDF and Email Delivery | Generate JBS-branded PDF, send copies |
| **Phase 5** | Admin, Hardening, QA | Admin review, security audit, end-to-end QA, launch |
| **Future** | Post-launch | Login, admin dashboard, white-label, AIA license, owner billing |

Work proceeds **sequentially** through phases. Phases 2–4 can overlap only after Phase 0 decisions are confirmed. Phase 1 (frontend prototype) can run in parallel with Phase 2 (backend) once Phase 0 is complete.

---

## Phase 0 — Client Decisions and Setup

---

### TICKET-001 — Confirm AIA Template Decision: Licensed vs. JBS-Branded PDF

**Phase:** 0 — Client Decisions  
**Priority:** Blocker — nothing else can be built until this is resolved  

**Goal:**  
Get a definitive client decision on whether the generated PDF will be an officially licensed AIA G702/G703 document or a JBS-branded "Application for Payment" document that captures the same business data without copying AIA-copyrighted content.

**Scope:**  
- Present client with the two options from `docs/AIA_G702_G703_GENERATOR_PLAN.md`, Section 4.
- Obtain written confirmation of the chosen path.
- If Option A (AIA license) is chosen: initiate AIA contract document licensing process; implementation is blocked until a license is in place.
- If Option B (JBS-branded) is chosen: implementation may proceed immediately.

**Out of scope:**  
- Building any PDF templates.
- Contacting AIA on behalf of the client.
- Drafting legal/license agreements.

**Acceptance criteria:**  
- [ ] Client has confirmed in writing: Option A (AIA license) or Option B (JBS-branded PDF).
- [ ] Decision is documented in `docs/AIA_G702_G703_GENERATOR_PLAN.md` under Section 4 or in a brief addendum.
- [ ] If Option A: AIA licensing process has been initiated by JBS or their attorney; a blockers note is added to TICKET-010 (PDF Generation).
- [ ] If Option B: implementation may proceed; TICKET-010 proceeds with JBS-branded approach.

**Dependencies / blockers:**  
- None. This is the first action.

**Notes for agent/developer:**  
This ticket does not involve any code or file changes. It is a business decision gate. Do not begin TICKET-002 through TICKET-010 until this decision is documented.

---

### TICKET-002 — Collect and Document Pre-Implementation Client Answers

**Phase:** 0 — Client Decisions  
**Priority:** High — several tickets require these answers before implementation  

**Goal:**  
Resolve the open questions from `docs/AIA_G702_G703_GENERATOR_PLAN.md`, Section 19 so that implementation tickets have no ambiguity about configuration and business rules.

**Scope:**  
Walk through each open question with the client and record the answers. The key items are:

| # | Question | Needed by |
|---|---|---|
| 1 | AIA license decision | TICKET-001 |
| 2 | AP email address(es) that should receive every copy | TICKET-012 (Email) |
| 3 | Does JBS have a Stripe account, or must one be created? | TICKET-008 (Stripe) |
| 4 | Data retention policy for submissions and PDFs | TICKET-007 (Database) |
| 5 | Does the $9.99 go directly to JBS or involve revenue share / Stripe Connect? | TICKET-008 (Stripe) |
| 6 | Download link expiry: is 24 hours acceptable? | TICKET-010 (PDF) |
| 7 | Re-download policy: who handles re-issue requests? | TICKET-010 (PDF) |
| 8 | Default retainage percentage (10% standard?) | TICKET-003 (Form UI) |
| 9 | Should "Contractor (GC)" default to "JBS Construction"? | TICKET-003 (Form UI) |
| 10 | Application number: auto-increment or manual entry? | TICKET-007 (Database) |
| 11 | Is mobile form-filling a first-class requirement? | TICKET-003 (Form UI) |

**Out of scope:**  
- Implementing anything.

**Acceptance criteria:**  
- [ ] All 11 open questions have documented answers.
- [ ] Answers are recorded as a brief addendum in `docs/AIA_G702_G703_GENERATOR_PLAN.md` or a separate decisions log.
- [ ] Any question whose answer changes the architecture is flagged and the relevant ticket is updated.

**Dependencies / blockers:**  
- TICKET-001 (Question 1 overlaps).

**Notes for agent/developer:**  
Answers to questions 2, 5, and 9 directly affect environment variable names and default values used in later tickets. Record the exact values that should go into `.env.example`.

---

## Phase 1 — Form UI (No Payment)

> **Goal of this phase:** A working, completable multi-step form in the browser that validates correctly and computes all auto-calculated totals. No backend, no payment, no real data storage. This phase produces a demo-able UI the client can review before backend work begins.

---

### TICKET-003 — Build Multi-Step Payment Application Form UI

**Phase:** 1 — Form UI  
**Priority:** High  
**Repo:** `jbs-site`  

**Goal:**  
Build the complete 5-step payment application form as a React island inside the JBS client portal. The form must be fully functional in the browser — all fields, validation, and auto-calculated totals — without any backend integration.

**Scope:**  
- Create `src/pages/client-portal/payment-application.astro` as the entry point page.
- Build React components under `src/components/PaymentApplication/`:
  - `PaymentApplicationForm.tsx` — main multi-step container; manages step state
  - `FormProgress.tsx` — step indicator (Step 1 of 5)
  - `steps/Step1Company.tsx` — company and contact info fields
  - `steps/Step2Project.tsx` — project and contract info fields
  - `steps/Step3ContinuationSheet.tsx` — dynamic SOV line-item table
  - `steps/Step4Summary.tsx` — read-only calculated summary
  - `steps/Step5Payment.tsx` — pay button (disabled/stubbed in this ticket — Stripe is Phase 3)
  - `LineItemRow.tsx` — single continuation sheet row component
  - `CurrencyInput.tsx` — formatted currency input (displays as `$1,234.56`, stores as integer cents)
  - `ApplicationSummaryTable.tsx` — reusable calculated totals table
- Implement all fields from plan Section 7 (Sections A–F).
- Implement all auto-calculated fields with live updates as inputs change.
- Implement add/remove row behavior on the continuation sheet (minimum 1 row).
- Implement client-side validation with inline error messages before each step advance.
- Match JBS visual language: `bg-jbs-dark`, `text-jbs-blue`, `font-heading` uppercase labels, `FadeInSection`, existing `Navbar` and `Footer`.
- Form state lives in React (no backend calls in this ticket).
- The "Pay $9.99" button on Step 5 renders but is disabled with a `[Payment coming soon]` placeholder — it must not call any API.
- Run `npm run build` after completing the UI to verify no TypeScript or build errors.

**Out of scope:**  
- Any API calls or backend integration.
- Stripe SDK or payment processing.
- Database writes or reads.
- PDF generation.
- Email sending.
- Success or cancelled pages (stubs are fine).
- Login or auth.

**Acceptance criteria:**  
- [ ] `src/pages/client-portal/payment-application.astro` exists and loads at `/client-portal/payment-application`.
- [ ] All 5 steps render and are navigable (Next/Back).
- [ ] Step 3 continuation sheet allows adding and removing rows; minimum 1 row enforced.
- [ ] All auto-calculated fields (Contract Sum to Date, Total Earned Less Retainage, Current Payment Due, Balance to Finish, per-row totals, % complete) update in real time as inputs change.
- [ ] Currency inputs display formatted values and store cents internally.
- [ ] Step 4 summary shows all calculated totals correctly from known test inputs.
- [ ] Client-side validation prevents step advance when required fields are missing or invalid.
- [ ] Page passes `npm run build` with no errors.
- [ ] Page is responsive: usable on iPhone-size viewport (375px wide) and desktop.
- [ ] No Stripe SDK, no API calls, no environment variables used in this ticket.

**Suggested files to change:**  
```
src/pages/client-portal/payment-application.astro        (new)
src/pages/client-portal/payment-application/success.astro (stub, new)
src/components/PaymentApplication/PaymentApplicationForm.tsx   (new)
src/components/PaymentApplication/FormProgress.tsx             (new)
src/components/PaymentApplication/CurrencyInput.tsx            (new)
src/components/PaymentApplication/LineItemRow.tsx              (new)
src/components/PaymentApplication/ApplicationSummaryTable.tsx  (new)
src/components/PaymentApplication/steps/Step1Company.tsx       (new)
src/components/PaymentApplication/steps/Step2Project.tsx       (new)
src/components/PaymentApplication/steps/Step3ContinuationSheet.tsx (new)
src/components/PaymentApplication/steps/Step4Summary.tsx       (new)
src/components/PaymentApplication/steps/Step5Payment.tsx       (new)
```

**Dependencies / blockers:**  
- TICKET-001 and TICKET-002 must be complete (to know field defaults like retainage %, GC name default, mobile priority).

**Testing / verification:**  
- Manual: navigate all 5 steps with a complete, realistic test application (a multi-line SOV, change orders, retainage).
- Verify calculated totals by hand with known inputs.
- Test on mobile (375px) and desktop (1440px).
- Run `npm run build`; confirm zero TypeScript errors.

**Notes for agent/developer:**  
- Store all currency values as integers (cents) in state to avoid floating-point arithmetic errors. Format for display only.
- `CurrencyInput` is a shared primitive — build it once, use it on every monetary field.
- The `Step5Payment` component will be wired to Stripe in TICKET-008. Keep the props interface clean so wiring is a small change later.
- Check the existing `subcontractors.astro` page for the correct JBS dark-theme pattern to follow.

---

### TICKET-004 — Add Payment Application Entry Point to Client Portal Navigation

**Phase:** 1 — Form UI  
**Priority:** Medium  
**Repo:** `jbs-site`  

**Goal:**  
Add the Payment Application tool as a visible entry point within the client portal area so subcontractors can find it. This may be a card or link on a client portal hub page, or a direct link in the Navbar under a "Client Portal" dropdown.

**Scope:**  
- Audit the current client portal pages: `src/pages/client-portal/subcontractors.astro`.
- Determine whether a client portal hub/landing page exists. If not, create a minimal `src/pages/client-portal/index.astro` that links to both the subcontractor questionnaire and the new payment application tool.
- Add the payment application link with a brief description: e.g., "Submit a Payment Application — $9.99 per application."
- Update the Navbar (if a "Client Portal" dropdown exists) to include the new link.

**Out of scope:**  
- Building the payment application form itself (TICKET-003).
- Auth-gating the client portal.
- Changing the subcontractor questionnaire page.

**Acceptance criteria:**  
- [ ] There is a discoverable path from the main site to `/client-portal/payment-application`.
- [ ] The link text clearly communicates this is a paid tool.
- [ ] `npm run build` passes with no errors.

**Suggested files to change:**  
```
src/pages/client-portal/index.astro            (new or existing)
src/components/Navbar.tsx                      (if dropdown update needed)
```

**Dependencies / blockers:**  
- TICKET-003 (the page must exist before linking to it).

**Testing / verification:**  
- Visit the site; confirm the payment application link is visible and navigates correctly.
- Run `npm run build`.

---

## Phase 2 — Backend Storage

> **Goal of this phase:** Database schema, Go models, and API endpoints for storing payment application submissions and checking their status. No Stripe, no PDF, no email yet. By end of this phase, the frontend can POST form data and receive a submission ID.

---

### TICKET-005 — Define and Create Submission Database Schema

**Phase:** 2 — Backend Storage  
**Priority:** High  
**Repo:** `jbs-internal-portal`  

**Goal:**  
Create the database migration for the `payment_application_submissions` table and the Go model types.

**Scope:**  
- Write a migration SQL file in `jbs-internal-portal/backend/migrations/` (or wherever existing migrations live):
  ```
  YYYYMMDD_create_payment_application_submissions.sql
  ```
- The schema must match the conceptual schema in `docs/AIA_G702_G703_GENERATOR_PLAN.md`, Section 10, including:
  - `id UUID PRIMARY KEY`
  - Status enum: `pending_payment | paid | generating | complete | failed`
  - All subcontractor contact fields
  - All project fields
  - Monetary fields as `BIGINT` (cents)
  - `line_items JSONB` and `change_orders JSONB`
  - PDF storage and token fields
  - Audit fields (`ip_address`, `user_agent`, `jbs_copy_sent_at`, `sub_copy_sent_at`)
  - `tenant_id TEXT NOT NULL DEFAULT 'jbs'` (white-label support from day one)
- Write Go model structs in `internal/paymentapp/models.go`:
  - `PaymentApplicationSubmission`
  - `LineItem`
  - `ChangeOrder`
  - `SubmissionStatus` type with constants
- Write `internal/paymentapp/repository.go` with functions:
  - `CreateSubmission(ctx, submission) (UUID, error)`
  - `GetSubmissionByID(ctx, id) (PaymentApplicationSubmission, error)`
  - `GetSubmissionByStripeSessionID(ctx, sessionID) (PaymentApplicationSubmission, error)`
  - `UpdateSubmissionStatus(ctx, id, status) error`
  - `UpdateSubmissionPDF(ctx, id, storagePath, downloadToken, expiresAt) error`
  - `UpdateSubmissionEmailSent(ctx, id, field) error`

**Out of scope:**  
- HTTP handlers (TICKET-006).
- Stripe fields can be present in the schema but are set to null until Phase 3.
- PDF generation fields can be present but are empty until Phase 4.
- Admin query endpoints (TICKET-013).

**Acceptance criteria:**  
- [ ] Migration file exists and is runnable against the Railway Postgres instance in the test environment.
- [ ] All columns from the plan schema are present.
- [ ] `tenant_id` column exists with default `'jbs'`.
- [ ] Go model structs compile with no errors.
- [ ] Repository functions are implemented with proper SQL queries.
- [ ] Repository unit tests pass for Create, GetByID, UpdateStatus.
- [ ] Migration is NOT run against the production database in this ticket (test only).

**Suggested files to change:**  
```
backend/migrations/YYYYMMDD_create_payment_application_submissions.sql  (new)
backend/internal/paymentapp/models.go       (new)
backend/internal/paymentapp/repository.go   (new)
```

**Dependencies / blockers:**  
- TICKET-002 (need answers to: application number auto-increment vs. manual; retainage default; data retention policy).
- Access to the Railway Postgres test/dev instance.

**Testing / verification:**  
- Run migration against test database; verify table created with correct column types.
- Run repository unit tests with a test database connection.
- Confirm `tenant_id` defaults to `'jbs'` on insert.

**Notes for agent/developer:**  
- All monetary values are `BIGINT` storing cents. Never use `FLOAT` or `NUMERIC` for money columns.
- `line_items` and `change_orders` are JSONB. Keep the Go struct tags consistent with the JSON shapes documented in the plan.
- The `ip_address` field should be masked (store only first 3 octets, or hash with a fixed salt) before insert. Do not store full IP addresses in plain text.

---

### TICKET-006 — Build Submission API Endpoints (Create and Status)

**Phase:** 2 — Backend Storage  
**Priority:** High  
**Repo:** `jbs-internal-portal`  

**Goal:**  
Implement the HTTP handlers that accept a payment application form submission from the frontend, validate it, store a `pending_payment` record, and return a submission ID. Also implement the status-polling endpoint.

**Scope:**  
- Create `internal/paymentapp/handler.go` with handlers for:
  - `POST /api/payment-application/create-session`
    - Parse and validate all incoming fields (see plan Section 13 for validation rules)
    - Store a new submission with status `pending_payment`
    - In Phase 3, this endpoint will also create the Stripe Checkout session. For now, return `{ submission_id: "..." }` and a `201`.
  - `GET /api/payment-application/status/:session_id`
    - Return `{ status: "...", download_url: null | "..." }` for the given Stripe session ID or submission UUID
- Create `internal/paymentapp/service.go` with validation logic extracted from the handler:
  - Validate all required fields
  - Validate monetary values (non-negative, within bounds)
  - Validate retainage percent (0–50)
  - Validate email format
  - Validate US phone format
  - Validate ZIP format
  - Validate at least 1 continuation sheet line item
  - Validate `period_to` is not more than 90 days in the future
- Register new routes in `cmd/server/main.go` (or wherever routes are registered).
- Apply rate limiting to `POST /api/payment-application/create-session`: max 5 requests per IP per hour.
- Configure CORS to allow `https://buildwithjbs.com` and `http://localhost:4321`.

**Out of scope:**  
- Stripe Checkout session creation (Phase 3 — the endpoint stub returns submission_id for now).
- PDF generation.
- Email sending.
- Webhook handler (TICKET-008).
- Download endpoint (TICKET-010).
- Admin endpoints (TICKET-013).

**Acceptance criteria:**  
- [ ] `POST /api/payment-application/create-session` accepts a valid payload and returns `201` with `submission_id`.
- [ ] Invalid payloads (missing required fields, invalid email, monetary value out of range, zero line items) return `400` with a structured error message identifying the failing field(s).
- [ ] A submission record is written to the database with status `pending_payment`.
- [ ] `GET /api/payment-application/status/:id` returns the correct status for a known submission UUID.
- [ ] Rate limiting rejects a 6th request from the same IP within an hour with `429`.
- [ ] CORS headers are present on responses for the allowed origins.
- [ ] No Stripe SDK imported or called in this ticket.
- [ ] Integration tests pass for happy path and all documented error cases.

**Suggested files to change:**  
```
backend/internal/paymentapp/handler.go   (new)
backend/internal/paymentapp/service.go   (new)
backend/cmd/server/main.go               (add routes)
```

**Dependencies / blockers:**  
- TICKET-005 (database schema and repository must exist).

**Testing / verification:**  
- Unit test all validation rules in `service.go` with boundary values.
- Integration test `POST /api/payment-application/create-session` with a valid full payload; confirm DB record.
- Integration test with a payload missing each required field; confirm `400`.
- Test rate limiting with 6 rapid requests; confirm `429` on 6th.
- Test CORS preflight from `localhost:4321`.

**Notes for agent/developer:**  
- Keep the `create-session` handler's Stripe logic isolated behind an interface so Phase 3 can swap in the real Stripe call without restructuring the handler.
- Submission IDs in the status endpoint URL must be UUIDs, not sequential integers, to prevent enumeration.

---

### TICKET-007 — Wire Frontend Form to Backend (Submit Without Payment)

**Phase:** 2 — Backend Storage  
**Priority:** Medium  
**Repo:** `jbs-site`  

**Goal:**  
Connect the Phase 1 form UI to the Phase 2 backend so that submitting the form stores a real `pending_payment` record. The "Pay $9.99" button still does not process payment; it calls the backend and confirms data was received.

**Scope:**  
- Update `Step5Payment.tsx` to POST form data to `POST api.buildwithjbs.com/api/payment-application/create-session` on button click.
- Handle the `submission_id` returned in the response.
- Show a loading state while the request is in-flight.
- Show a user-facing error if the request fails (validation errors from backend displayed inline).
- After a successful 201 response, display a confirmation message: "Your application has been submitted. Payment processing coming soon." (temporary placeholder).
- Add `PUBLIC_API_BASE_URL` to the frontend environment variables (`import.meta.env.PUBLIC_API_BASE_URL`).
- Add `PUBLIC_API_BASE_URL` to `.env.example` with the value `https://api.buildwithjbs.com`.

**Out of scope:**  
- Stripe redirect or payment processing.
- PDF generation or download.
- Email sending.

**Acceptance criteria:**  
- [ ] Completing the form and clicking the submit button results in a `pending_payment` record in the database.
- [ ] Network errors and backend validation errors are surfaced to the user with readable messages.
- [ ] `PUBLIC_API_BASE_URL` is used everywhere API calls are made (no hardcoded URLs).
- [ ] `.env.example` is updated with the new variable.
- [ ] `npm run build` passes with no errors.

**Suggested files to change:**  
```
src/components/PaymentApplication/steps/Step5Payment.tsx   (update)
.env.example                                               (update)
```

**Dependencies / blockers:**  
- TICKET-003 (form UI).
- TICKET-006 (backend endpoint live in dev/staging environment).

**Testing / verification:**  
- Submit a complete test application; confirm record appears in test database with status `pending_payment`.
- Submit an incomplete application; confirm inline error messages from backend validation.
- Verify no hardcoded `api.buildwithjbs.com` strings in source — all API base URLs come from env.

---

## Phase 3 — Stripe Payment

> **Goal of this phase:** Wire real payment collection into the existing submission flow. By end of this phase, subcontractors can pay $9.99 and receive a payment confirmation; the submission status advances to `paid`. PDF and email are stubbed (not yet implemented).

---

### TICKET-008 — Add Stripe Checkout Session Creation and Webhook Handler

**Phase:** 3 — Stripe Payment  
**Priority:** High  
**Repo:** `jbs-internal-portal`  
**Pre-requisite client action:** Stripe account confirmed (TICKET-002, Question 3)  

**Goal:**  
Integrate Stripe Checkout into the `create-session` endpoint and implement the webhook handler that advances submission status to `paid` upon confirmed payment.

**Scope:**  
- Add the Stripe Go SDK (`github.com/stripe/stripe-go/v76` or latest) to `jbs-internal-portal/backend/go.mod`.
- Update `POST /api/payment-application/create-session` to:
  - Create a Stripe Checkout Session with:
    - 1 line item: "JBS Application for Payment" @ $9.99 (999 cents)
    - `success_url`: `https://buildwithjbs.com/client-portal/payment-application/success?session_id={CHECKOUT_SESSION_ID}`
    - `cancel_url`: `https://buildwithjbs.com/client-portal/payment-application?cancelled=true`
    - `metadata.submission_id`: the UUID stored in the database
  - Store the Stripe session ID on the submission record
  - Return `{ checkout_url: "https://checkout.stripe.com/..." }` to the frontend
- Implement `POST /api/stripe/webhook` in a new file `internal/paymentapp/webhook.go` (or a shared `internal/stripe/webhook.go`):
  - Verify the `Stripe-Signature` header using the webhook signing secret. Reject without processing if invalid.
  - Handle `checkout.session.completed`:
    - Look up submission by Stripe session ID
    - Update status to `paid`; record `paid_at` and `amount_paid_cents`
    - Stub the PDF generation call (log "PDF generation not yet implemented" and return 200 — no error)
  - Handle idempotency: if the event has already been processed, return 200 without re-processing.
- Add required environment variables to `.env.example` in the backend:
  - `STRIPE_SECRET_KEY` — set to `sk_test_...` in development; never committed
  - `STRIPE_WEBHOOK_SIGNING_SECRET` — from Stripe dashboard webhook config
  - `STRIPE_PRICE_ID` — optional, or configure product/price inline
- Register the webhook route in `cmd/server/main.go`.
- **Do not use live Stripe keys during this ticket.** Use Stripe test mode only.

**Out of scope:**  
- PDF generation (TICKET-010).
- Email sending (TICKET-012).
- Admin management of submissions.
- Stripe Connect or revenue share (resolve in TICKET-002 first).

**Acceptance criteria:**  
- [ ] `POST /api/payment-application/create-session` now returns a `checkout_url` to Stripe Checkout.
- [ ] Using a Stripe test card, completing the checkout flow fires a `checkout.session.completed` webhook.
- [ ] Webhook handler verifies signature; rejects requests without a valid `Stripe-Signature` with 400.
- [ ] On valid `checkout.session.completed`, submission status advances to `paid`.
- [ ] Duplicate webhook delivery is handled idempotently (second delivery returns 200, does not double-update).
- [ ] `STRIPE_SECRET_KEY` is **never** committed to source control or logged.
- [ ] The Stripe Webhook Signing Secret is **never** hardcoded.
- [ ] Test mode works end-to-end with Stripe CLI (`stripe listen --forward-to localhost:8080/api/stripe/webhook`).
- [ ] Unit tests exist for: signature verification (valid and invalid), idempotency, status transition.

**Suggested files to change:**  
```
backend/go.mod                                          (add stripe-go)
backend/go.sum                                          (updated by go mod tidy)
backend/internal/paymentapp/handler.go                  (update create-session)
backend/internal/paymentapp/webhook.go                  (new)
backend/cmd/server/main.go                              (register webhook route)
backend/.env.example                                    (add Stripe env vars)
```

**Dependencies / blockers:**  
- TICKET-006 (create-session endpoint must exist).
- TICKET-002 (Stripe account confirmed; direct charge vs. Stripe Connect decided).
- Stripe test account and test API keys available to the developer (not in source control).

**Testing / verification:**  
- Use Stripe CLI to simulate `checkout.session.completed` with a valid test payload.
- Confirm submission status in test database transitions to `paid`.
- Simulate a `checkout.session.completed` with a forged signature; confirm rejection.
- Replay the same event twice; confirm no duplicate processing.
- Run `go test ./internal/paymentapp/...` — all tests pass.

**Security notes:**  
- Stripe webhook endpoint must be excluded from any CSRF protection middleware (Stripe cannot send CSRF tokens).
- Do not log the raw request body of Stripe webhook events (may contain sensitive Stripe data).
- Rotate the webhook signing secret if it is ever exposed.

---

### TICKET-009 — Wire Frontend to Stripe Checkout Redirect

**Phase:** 3 — Stripe Payment  
**Priority:** High  
**Repo:** `jbs-site`  

**Goal:**  
Update the frontend so that clicking "Pay $9.99" redirects the browser to Stripe Checkout. Implement the success and cancelled pages.

**Scope:**  
- Update `Step5Payment.tsx`:
  - POST form data to `create-session`
  - Receive `checkout_url` in the response
  - `window.location.href = checkout_url` (redirect to Stripe)
  - Show loading state during the API call
  - Show error state if the API call fails before redirect
- Build `src/pages/client-portal/payment-application/success.astro`:
  - Extract `session_id` from the URL query parameter
  - Poll `GET /api/payment-application/status/:session_id` every 3 seconds until status is `complete` or a timeout is reached (30 seconds)
  - While polling: show "Generating your application..." with a spinner
  - On `complete`: show download button (signed URL from the status response) and confirmation messages
  - On timeout: show a message with the AP contact email to follow up
  - On `failed`: show an error message with contact info
- Build `src/pages/client-portal/payment-application/cancelled.astro`:
  - Friendly "Payment was cancelled" page
  - Link back to the form
- Update `vercel.json` CSP headers to allow Stripe domains:
  - `script-src`: add `https://js.stripe.com`
  - `frame-src`: add `https://js.stripe.com https://hooks.stripe.com`
  - `connect-src`: add `https://api.stripe.com`
  - `form-action`: add `https://checkout.stripe.com`

**Out of scope:**  
- Stripe Payment Element (embedded UI) — use hosted Checkout only.
- The download button will be inactive/greyed if PDF is not yet ready (Phase 4 completes it).

**Acceptance criteria:**  
- [ ] Clicking "Pay $9.99" with a complete form redirects to Stripe Checkout.
- [ ] Using a Stripe test card, completing payment lands on the success page with `session_id` in the URL.
- [ ] Success page shows "Generating your application..." while polling.
- [ ] Clicking "Cancel" on Stripe Checkout returns to the cancelled page.
- [ ] Cancelled page has a link back to the form.
- [ ] CSP headers in `vercel.json` include all required Stripe domains.
- [ ] No Stripe secret keys are present in frontend code or env vars.
- [ ] `npm run build` passes with no errors.

**Suggested files to change:**  
```
src/components/PaymentApplication/steps/Step5Payment.tsx             (update)
src/pages/client-portal/payment-application/success.astro            (new)
src/pages/client-portal/payment-application/cancelled.astro          (new)
vercel.json                                                           (update CSP)
```

**Dependencies / blockers:**  
- TICKET-008 (backend must return `checkout_url`).
- TICKET-003 (form UI must exist).

**Testing / verification:**  
- Complete a full test checkout with a Stripe test card; verify success page loads and polls.
- Cancel the checkout; verify cancelled page loads with correct copy.
- Verify no CSP violations in browser console during Stripe redirect.
- Run `npm run build`.

---

## Phase 4 — PDF Generation and Email Delivery

> **Goal of this phase:** After a confirmed payment, generate the JBS-branded PDF, upload it to storage, generate a signed download URL, and deliver copies to the subcontractor and JBS/AP by email.

---

### TICKET-010 — Generate JBS-Branded Application for Payment PDF

**Phase:** 4 — PDF Generation  
**Priority:** High  
**Repo:** `jbs-internal-portal`  
**Pre-requisite:** TICKET-001 (AIA license decision confirmed — must be Option B to proceed)  

**Goal:**  
Implement server-side PDF generation of a JBS-branded "Application for Payment" document from a stored submission record. The PDF must contain only original JBS-authored content — no AIA form text, labels, or layout.

**Scope:**  
- Choose and add the PDF generation library to `go.mod`:
  - Recommended: `chromedp` + Go HTML template (most design flexibility)
  - Alternative: `go-pdf/fpdf` (zero external binary dependency)
  - Decision must be documented in the commit message
- Create an HTML/CSS template (for `chromedp` path) or layout code (for `fpdf` path) that produces:
  - **Page 1:** JBS logo, "Application for Payment" heading, document ID, subcontractor info block, project info block, contract value summary table, certification acknowledgment checkbox line, "Generated by JBS Construction Client Portal" footer, "Not an official AIA document" disclaimer
  - **Page 2+:** JBS header, schedule of values / continuation sheet line-item table, page number and document ID footer
- Implement `internal/paymentapp/pdf.go`:
  - `GeneratePDF(ctx, submission) ([]byte, error)`
  - Called from the webhook handler after status advances to `paid`
- Implement `internal/paymentapp/storage.go`:
  - Upload generated PDF bytes to Cloudflare R2 (or chosen storage)
  - Return the internal storage path
  - Generate a pre-signed download URL with 24-hour TTL
  - Store path and token in the submission record via `repository.UpdateSubmissionPDF`
- Update submission status to `complete` after successful PDF upload

**Out of scope:**  
- Official AIA document layout, labels, or boilerplate — **strictly prohibited** (see TICKET-001)
- Email sending (TICKET-012)
- Admin download endpoint (TICKET-013)
- Legal/compliance language
- Lien waivers, notary blocks

**Acceptance criteria:**  
- [ ] A PDF is generated from a test submission record without errors.
- [ ] PDF contains JBS logo, correct project and subcontractor data, all calculated values from the submission.
- [ ] PDF contains "Not an official AIA document" disclaimer on Page 1.
- [ ] PDF does **not** contain the phrases "AIA Document G702," "AIA Document G703," or any text copied from official AIA forms.
- [ ] PDF is uploaded to storage and the internal path is recorded in the database.
- [ ] A 24-hour signed download URL is generated and stored in `pdf_download_token` / `pdf_download_expires_at`.
- [ ] Submission status advances to `complete` after successful upload.
- [ ] PDF generation failure sets status to `failed` and logs the error.
- [ ] Unit test: generate PDF from fixture data; assert non-zero file size and presence of expected content strings.
- [ ] Storage integration test: upload a test file; retrieve via signed URL; confirm 200 response.

**Suggested files to change:**  
```
backend/go.mod                                      (add PDF library)
backend/internal/paymentapp/pdf.go                  (new)
backend/internal/paymentapp/storage.go              (new)
backend/internal/paymentapp/webhook.go              (update — call PDF + storage)
backend/.env.example                                (add storage credentials)
```

**Dependencies / blockers:**  
- TICKET-001 (AIA license decision must be Option B).
- TICKET-008 (webhook handler must exist).
- TICKET-005 (repository `UpdateSubmissionPDF` must exist).
- Storage bucket configured (Cloudflare R2 bucket name, access key, secret — in env, never in source).

**Testing / verification:**  
- Generate a PDF from a realistic fixture submission with 5+ SOV line items and 2 change orders.
- Open the generated PDF and manually verify content accuracy and visual quality.
- Verify PDF disclaimer text is present.
- Verify no AIA-copyrighted text appears anywhere.
- Run all backend tests: `go test ./internal/paymentapp/...`

**Notes for agent/developer:**  
- If using `chromedp`, Railway must have Chrome available. Verify the Dockerfile or Railway base image includes headless Chrome before starting implementation.
- Keep the HTML template in a separate file (`internal/paymentapp/templates/payment_application.html`) for easy design iteration.
- Never expose the internal storage path in API responses. Only expose the signed URL.

---

### TICKET-011 — Implement Download Token Endpoint

**Phase:** 4 — PDF Generation  
**Priority:** High  
**Repo:** `jbs-internal-portal`  

**Goal:**  
Add the download endpoint that validates a signed token and redirects the user's browser to the storage signed URL. This is what the frontend download button hits.

**Scope:**  
- Implement `GET /api/payment-application/download/:token`:
  - Look up the submission by `pdf_download_token`
  - Validate that `pdf_download_expires_at` has not passed
  - If valid: redirect (302) to the storage pre-signed URL
  - If expired: return 410 Gone with a message instructing the user to contact JBS
  - If token not found: return 404
- Update the status endpoint (`GET /api/payment-application/status/:session_id`) to include `download_url` (pointing to this endpoint, e.g., `https://api.buildwithjbs.com/api/payment-application/download/:token`) once status is `complete`.
- The storage pre-signed URL is **never** returned directly to the browser — always proxied through this endpoint.

**Out of scope:**  
- Token refresh / re-issue (post-launch support workflow, noted as future).
- Admin long-lived download links (TICKET-013).

**Acceptance criteria:**  
- [ ] `GET /api/payment-application/download/:valid-token` returns a 302 redirect to the storage signed URL and triggers PDF download in the browser.
- [ ] A request with an expired token returns 410 with a user-readable message.
- [ ] A request with an unknown token returns 404.
- [ ] The status endpoint includes `download_url` in its response when status is `complete`.
- [ ] The success page download button (TICKET-009) triggers PDF download successfully end-to-end.

**Suggested files to change:**  
```
backend/internal/paymentapp/handler.go   (add download handler)
backend/cmd/server/main.go               (register download route)
```

**Dependencies / blockers:**  
- TICKET-010 (PDF must be generated and token stored).
- TICKET-009 (success page must use the download URL from the status response).

**Testing / verification:**  
- End-to-end test: pay → PDF generated → success page shows download button → click → PDF downloads.
- Test with an expired token; confirm 410.
- Confirm the raw storage URL (R2/S3) is never exposed in API responses.

---

### TICKET-012 — Send Email Copies to Subcontractor and JBS/AP

**Phase:** 4 — Email Delivery  
**Priority:** High  
**Repo:** `jbs-internal-portal`  
**Pre-requisite client action:** AP email address confirmed (TICKET-002, Question 2)  

**Goal:**  
After PDF generation completes, send two emails: a confirmation with download link to the subcontractor, and a copy with the PDF attached to JBS/AP.

**Scope:**  
- Add Resend Go SDK to `go.mod` (or chosen email service — see plan Section 12).
- Implement `internal/paymentapp/email.go`:
  - `SendSubcontractorConfirmation(ctx, submission, downloadURL) error`
    - To: `submission.sub_email`
    - Subject: `Your JBS Application for Payment — [Project Name] — Application #[N]`
    - Body: confirmation, application summary (key totals), download link (24-hour TTL), note about JBS copy
  - `SendAPCopy(ctx, submission, pdfBytes) error`
    - To: `JBS_AP_EMAIL` (from environment variable — never hardcoded)
    - Subject: `New Payment Application Received — [Subcontractor] — [Project Name] — Application #[N]`
    - Body: full submission details and all calculated totals
    - Attachment: PDF file (if < 5 MB; otherwise include a long-lived download link)
- Call both functions from the webhook handler after `GeneratePDF` succeeds.
- Record `jbs_copy_sent_at` and `sub_copy_sent_at` timestamps in the database after each successful send.
- Email send failures should log an error and set submission status to `failed`; do not silently discard.
- Add required environment variables to `.env.example`:
  - `JBS_AP_EMAIL`
  - `RESEND_API_KEY` (or equivalent — never committed)
  - `EMAIL_FROM_ADDRESS` (e.g., `noreply@buildwithjbs.com`)

**Out of scope:**  
- Marketing emails or opt-in flows.
- Email template design beyond plain text + key data table.
- SMS notifications.

**Acceptance criteria:**  
- [ ] Subcontractor receives an email at their entered address with a download link after completing payment.
- [ ] JBS/AP receives an email at the configured AP address with PDF attached (or download link if >5 MB).
- [ ] `jbs_copy_sent_at` and `sub_copy_sent_at` are recorded in the database.
- [ ] `JBS_AP_EMAIL` is read from environment — not hardcoded.
- [ ] Email send failure is logged and submission status is set to `failed` (not silently dropped).
- [ ] Unit tests mock the email client and assert correct recipients, subjects, and attachments.
- [ ] End-to-end test (using Resend test mode or equivalent) confirms emails are delivered in staging.

**Suggested files to change:**  
```
backend/go.mod                                      (add resend SDK)
backend/internal/paymentapp/email.go                (new)
backend/internal/paymentapp/webhook.go              (call email functions)
backend/.env.example                                (add email env vars)
```

**Dependencies / blockers:**  
- TICKET-010 (PDF bytes must be available).
- TICKET-002 (AP email address confirmed).
- Email service account configured (API key in env, never in source).

**Testing / verification:**  
- Trigger a full end-to-end test in staging: complete form → pay (Stripe test card) → confirm both emails received.
- Verify subcontractor email download link resolves to the PDF.
- Verify AP email attachment or download link resolves to the correct PDF.
- Simulate email service failure; confirm error is logged and status is `failed`.

---

## Phase 5 — Admin, Hardening, and QA

> **Goal of this phase:** Provide JBS with basic visibility into stored submissions, harden security, and complete pre-launch QA.

---

### TICKET-013 — Basic Admin Submission List (Internal Portal)

**Phase:** 5 — Admin / Hardening  
**Priority:** Medium  
**Repo:** `jbs-internal-portal`  
**Note:** This ticket adds backend endpoints only. A frontend admin UI is a future enhancement.  

**Goal:**  
Add read-only API endpoints that allow JBS/AP to list and view stored payment application submissions for audit and follow-up purposes.

**Scope:**  
- Implement in `internal/paymentapp/handler.go`:
  - `GET /api/payment-application/admin` — paginated list of all submissions, newest first, with key fields (ID, status, company name, project name, application number, paid_at, amount)
  - `GET /api/payment-application/admin/:id` — full submission detail including all fields
  - `POST /api/payment-application/admin/:id/resend-emails` — re-trigger email sends for a completed submission (for support scenarios)
- Protect all `/admin` routes with the same authentication middleware used by other admin endpoints in `jbs-internal-portal`.
- Response must **not** include raw IP addresses (mask to first 3 octets or omit).
- Response must **not** include PDF storage paths — only expose the signed download token.

**Out of scope:**  
- Frontend admin dashboard UI.
- Submission editing or deletion.
- Approval/rejection workflow.
- Filtering by subcontractor or project (future enhancement).

**Acceptance criteria:**  
- [ ] `GET /api/payment-application/admin` returns a paginated list with correct fields.
- [ ] `GET /api/payment-application/admin/:id` returns full detail without raw IP or storage path.
- [ ] `POST /api/payment-application/admin/:id/resend-emails` re-triggers email send for a `complete` submission.
- [ ] All admin routes require valid authentication; unauthenticated requests return 401.
- [ ] Unit and integration tests cover list, detail, and resend endpoints.

**Suggested files to change:**  
```
backend/internal/paymentapp/handler.go   (add admin handlers)
backend/internal/paymentapp/repository.go (add list query)
backend/cmd/server/main.go               (register admin routes)
```

**Dependencies / blockers:**  
- TICKET-005 (database must exist).
- Existing auth middleware in `jbs-internal-portal` (from ACH vendor portal or other prior work).

---

### TICKET-014 — Security and Privacy Review

**Phase:** 5 — Hardening  
**Priority:** High  
**Repo:** Both `jbs-site` and `jbs-internal-portal`  

**Goal:**  
Conduct a focused security and privacy review of the entire payment application feature before going live. Identify and fix any gaps.

**Scope:**  
Review checklist (all items must be verified):

**Stripe Security**
- [ ] Stripe webhook signature is verified on every request (TICKET-008).
- [ ] No Stripe secret key is present in frontend code, `.env` committed files, or logs.
- [ ] Stripe webhook endpoint is excluded from CSRF middleware.
- [ ] CSP headers in `vercel.json` include all required Stripe domains (TICKET-009).

**API Security**
- [ ] All form input is validated server-side (TICKET-006).
- [ ] Rate limiting is active on `create-session` (TICKET-006).
- [ ] CORS allows only `buildwithjbs.com` and `localhost:4321` (not wildcard).
- [ ] UUIDs used for submission IDs in all URLs (no sequential integer enumeration).
- [ ] Admin endpoints require authentication.

**PDF and Storage**
- [ ] Generated PDFs are never served from a publicly guessable URL.
- [ ] All downloads go through the signed token endpoint (TICKET-011).
- [ ] Signed URLs expire in 24 hours.
- [ ] Storage bucket is not publicly accessible.

**Privacy**
- [ ] IP addresses are masked (first 3 octets only or hashed) before storage.
- [ ] Subcontractor email addresses are used only for transactional delivery.
- [ ] Data retention policy has been confirmed with the client (TICKET-002) and is documented.

**PDF Content**
- [ ] PDF contains no AIA-copyrighted text, form numbers, or layout (TICKET-010).
- [ ] PDF includes "Not an official AIA document" disclaimer.

**Acceptance criteria:**  
- [ ] All checklist items above are verified and checked off.
- [ ] Any identified gaps are fixed before this ticket is closed.
- [ ] A brief summary of the review findings is added as a comment or note on this ticket.

**Dependencies / blockers:**  
- TICKET-006, TICKET-008, TICKET-009, TICKET-010, TICKET-011, TICKET-012, TICKET-013 must all be complete.

---

### TICKET-015 — End-to-End QA and Pre-Launch Checklist

**Phase:** 5 — QA / Release  
**Priority:** High  
**Repo:** Both  

**Goal:**  
Execute the full manual QA checklist from `docs/AIA_G702_G703_GENERATOR_PLAN.md`, Section 17. Confirm all automated tests pass. Prepare for production launch.

**Scope:**  

**Automated tests**
- [ ] All backend unit tests pass: `go test ./...` in `jbs-internal-portal/backend`
- [ ] All backend integration tests pass against test database
- [ ] Frontend builds cleanly: `npm run build` in `jbs-site`

**Manual QA — Desktop (Chrome, Safari, Firefox)**
- [ ] Full form completes on each browser without JS errors
- [ ] All calculated fields update correctly with known test inputs
- [ ] Continuation sheet rows add and remove correctly
- [ ] Stripe Checkout opens with a Stripe test card
- [ ] After test payment, success page polls and shows download button
- [ ] PDF downloads and contains correct data
- [ ] PDF contains "Not an official AIA document" disclaimer
- [ ] JBS/AP receives email copy with PDF
- [ ] Subcontractor receives confirmation email with download link
- [ ] Download link expires after 24 hours (can be tested by manually setting expiry)
- [ ] Cancelled payment returns to the cancelled page

**Manual QA — Mobile (iOS Safari, Android Chrome)**
- [ ] Form is usable at 375px width
- [ ] Continuation sheet is navigable on mobile (card layout or horizontal scroll)
- [ ] Stripe Checkout completes on mobile

**Security spot-check**
- [ ] No Stripe keys in browser source (View Source, DevTools)
- [ ] No internal storage paths in network responses
- [ ] CSP headers present and contain Stripe domains

**Pre-production checklist**
- [ ] Stripe live keys configured in Railway environment (not test keys)
- [ ] `JBS_AP_EMAIL` configured in Railway environment
- [ ] Email service live API key configured in Railway environment
- [ ] Storage bucket (R2 or equivalent) configured in Railway environment
- [ ] Data retention policy documented and confirmed
- [ ] Client has reviewed and approved the PDF template design
- [ ] Legal review of PDF content completed (no AIA copyright issues)

**Launch**
- [ ] Deploy `jbs-site` to Vercel production
- [ ] Deploy `jbs-internal-portal` to Railway production
- [ ] Smoke test with a real $9.99 payment (first real submission)
- [ ] Monitor first 5 submissions for errors

**Acceptance criteria:**  
- [ ] All automated tests pass.
- [ ] All manual QA items checked off.
- [ ] All pre-production items confirmed.
- [ ] Feature is live and the first real submission succeeds.

**Dependencies / blockers:**  
- All Phase 1–5 tickets complete.
- Client has confirmed the PDF template, AP email, and data retention policy.
- Legal review of PDF content complete.

---

## Future — Post-Launch Enhancements

> These tickets are not scoped for v1. They are captured here so they can be added to the Trello backlog.

---

### TICKET-F01 — Subcontractor Login and Submission History

**Phase:** Future  

**Goal:** Allow subcontractors to create accounts and view/re-download their past applications.

**Key work:**
- Auth system (JWT or session-based) added to `jbs-internal-portal`
- User accounts table and account-submission linking
- Frontend login/registration flow in client portal
- Submission history dashboard
- On-demand re-issue of expired download links

**Dependencies:** All Phase 1–5 tickets; auth infrastructure decision.

---

### TICKET-F02 — JBS Admin Dashboard for Submission Review

**Phase:** Future  

**Goal:** Give JBS/AP a UI in `jbs-internal-portal` frontend to browse, search, and review all payment application submissions.

**Key work:**
- Admin table UI with filter by subcontractor, project, status, date range
- Detail view per submission
- Re-send email action
- Mark as reviewed action
- Export to CSV

**Dependencies:** TICKET-013 (admin API endpoints).

---

### TICKET-F03 — AIA Licensed Template Integration

**Phase:** Future (blocked on TICKET-001 — Option A decision)  

**Goal:** If JBS obtains an AIA license, swap the JBS-branded PDF generator for an official AIA G702/G703 output.

**Key work:**
- AIA license agreement and template access
- Legal review of integration approach
- Update `pdf.go` to produce AIA-compliant output
- Update PDF disclaimer language
- Regression test all data fields against AIA form layout

**Dependencies:** AIA license obtained; TICKET-010 complete.

---

### TICKET-F04 — White-Label Packaging for Other Construction Clients

**Phase:** Future  

**Goal:** Deploy the same payment application generator for a second construction client with their own branding, AP email, and database.

**Key work:**
- Tenant configuration system (logo, brand color, AP email, portal name per tenant)
- Deployment playbook for new tenant onboarding
- Multi-tenant routing (by domain or `tenant_id` header)
- `tenant_id` already present in database schema from TICKET-005

**Dependencies:** TICKET-001 through TICKET-015 complete; at least one interested client.

---

### TICKET-F05 — Owner/Client Billing (GC → Owner Invoice)

**Phase:** Future  

**Goal:** Generate payment applications from JBS (as GC) to the project owner — a separate, distinct document type.

**Key work:**
- Separate form type and database table for GC-to-owner applications
- Different calculated totals and document structure
- Potentially requires AIA license (G702 from GC to owner is the official form)

**Dependencies:** AIA license (likely required); TICKET-F01 for auth.

---

### TICKET-F06 — Lien Waiver Generation

**Phase:** Future  

**Goal:** Generate conditional and unconditional lien waivers tied to payment application submissions.

**Key work:**
- Legal review of lien waiver templates for each state (multi-state compliance is complex)
- New document type and generation flow
- Link to parent payment application submission

**Dependencies:** Legal counsel input required before any work begins.

---

## Ticket Summary Table

| Ticket | Phase | Title | Repo | Blocks |
|---|---|---|---|---|
| TICKET-001 | 0 | AIA License Decision | — | Everything |
| TICKET-002 | 0 | Collect Client Answers | — | Multiple |
| TICKET-003 | 1 | Build Multi-Step Form UI | jbs-site | TICKET-007, TICKET-009 |
| TICKET-004 | 1 | Add Entry Point to Portal Nav | jbs-site | — |
| TICKET-005 | 2 | Database Schema and Models | jbs-internal-portal | TICKET-006 |
| TICKET-006 | 2 | Build Submission API Endpoints | jbs-internal-portal | TICKET-007, TICKET-008 |
| TICKET-007 | 2 | Wire Frontend to Backend | jbs-site | TICKET-009 |
| TICKET-008 | 3 | Stripe Checkout + Webhook | jbs-internal-portal | TICKET-009, TICKET-010 |
| TICKET-009 | 3 | Wire Frontend to Stripe | jbs-site | TICKET-010, TICKET-011 |
| TICKET-010 | 4 | PDF Generation | jbs-internal-portal | TICKET-011, TICKET-012 |
| TICKET-011 | 4 | Download Token Endpoint | jbs-internal-portal | TICKET-012 |
| TICKET-012 | 4 | Email Delivery | jbs-internal-portal | TICKET-013 |
| TICKET-013 | 5 | Admin Submission List | jbs-internal-portal | TICKET-014 |
| TICKET-014 | 5 | Security and Privacy Review | Both | TICKET-015 |
| TICKET-015 | 5 | End-to-End QA and Launch | Both | — |
| TICKET-F01 | Future | Login and Submission History | Both | — |
| TICKET-F02 | Future | Admin Dashboard UI | jbs-internal-portal | — |
| TICKET-F03 | Future | AIA License Integration | jbs-internal-portal | — |
| TICKET-F04 | Future | White-Label Packaging | Both | — |
| TICKET-F05 | Future | Owner/Client Billing | Both | — |
| TICKET-F06 | Future | Lien Waiver Generation | Both | — |

---

*This document contains planning and ticket specifications only. No source code, Stripe keys, database migrations, or PDF generation are included. All implementation is subject to client approval of the planning document and confirmation of Phase 0 decisions, especially the AIA template licensing choice.*
