# AIA G702/G703 Payment Application Generator — Feature Plan

**Project:** JBS Construction — Subcontractor Payment Application Tool  
**Branch:** `feature/jbs-subcontractor-portal`  
**Date:** May 2026  
**Status:** Planning / Pre-Implementation  
**Author:** ITWill  

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Confirmed Requirements](#2-confirmed-requirements)
3. [Out of Scope for v1](#3-out-of-scope-for-v1)
4. [AIA Template and Licensing Considerations](#4-aia-template-and-licensing-considerations)
5. [Recommended v1 Scope](#5-recommended-v1-scope)
6. [User Flow](#6-user-flow)
7. [Form Sections and Fields](#7-form-sections-and-fields)
8. [Architecture Overview](#8-architecture-overview)
9. [Stripe Payment Flow](#9-stripe-payment-flow)
10. [Database and Storage Model](#10-database-and-storage-model)
11. [PDF Generation Approach](#11-pdf-generation-approach)
12. [JBS / AP Copy Delivery Flow](#12-jbs--ap-copy-delivery-flow)
13. [Backend and API Requirements](#13-backend-and-api-requirements)
14. [Security and Privacy Considerations](#14-security-and-privacy-considerations)
15. [White-Label Architecture Notes](#15-white-label-architecture-notes)
16. [Files and Routes to Be Added](#16-files-and-routes-to-be-added)
17. [Verification and Testing Plan](#17-verification-and-testing-plan)
18. [Future Enhancements](#18-future-enhancements)
19. [Open Questions for the Client](#19-open-questions-for-the-client)
20. [Recommended Implementation Phases](#20-recommended-implementation-phases)

---

## 1. Product Summary

JBS subcontractors currently fill out AIA G702/G703 payment application forms manually using Excel templates. This is time-consuming for subcontractors and creates support burden for the JBS accounts-payable team who must review, correct, and reformat submissions.

This feature adds a **paid, web-based payment application generator** to the JBS client portal at `buildwithjbs.com`. A subcontractor:

1. Navigates to the client portal and opens the payment application tool.
2. Enters company info, project details, contract figures, and a line-item continuation sheet.
3. Reviews a summary of the application.
4. Pays a one-time $9.99 fee via Stripe.
5. Receives a downloadable, JBS-branded "Application for Payment" PDF.
6. JBS/AP automatically receives a copy.

The $9.99 fee offsets operational costs and reduces low-effort or test submissions. No login is required in v1; every paid submission generates a document.

> **Note on "AIA G702/G703":** This tool targets the *business workflow* of the AIA G702/G703 process. It does **not** reproduce or copy official AIA form text, layout, or proprietary content. See [Section 4](#4-aia-template-and-licensing-considerations) for the full licensing discussion.

---

## 2. Confirmed Requirements

| # | Requirement | Source |
|---|---|---|
| 1 | Subcontractors fill out a payment application form on the JBS website. | Client |
| 2 | A $9.99 fee is charged per generated document (per payment event). | Client |
| 3 | JBS receives a copy of every generated form. | Client |
| 4 | No login is required for v1. | Client |
| 5 | Submissions are stored in a database. | Client |
| 6 | The feature lives inside the JBS client portal area (`/client-portal/`). | Client |
| 7 | JBS does **not** currently hold a licensed AIA PDF template. | Client |
| 8 | This feature is for subcontractor-to-GC payment applications only (not owner/client invoicing). | Client |
| 9 | Login/account support may be added in a future version. | Client |
| 10 | Architecture should be designed to allow white-labeling for other construction clients. | Client |

---

## 3. Out of Scope for v1

The following items are explicitly deferred to future phases:

- **Login and user accounts** — v1 is no-auth; sessions are not persisted to a user profile.
- **Owner/client invoicing** — Do not build owner-facing billing or invoice generation yet.
- **Admin review dashboard** — No internal portal UI for JBS to approve/reject submissions in v1; AP receives a copy by email.
- **Change order workflow** — Change order approval and tracking is not included.
- **Lien waiver generation** — Do not generate lien waivers or release documents.
- **Multi-project dashboards** — No aggregation of multiple submissions per company.
- **Retainage release certificates** — Not in v1.
- **Compliance/legal language** — Do not invent or include lien waiver, tax, or compliance language on the generated PDF.
- **ACH or bank data collection** — Handled separately via the ACH Vendor Portal (see `docs/ACH_VENDOR_PORTAL_PLAN.md`).
- **Stripe secret key configuration** — Not implemented in this planning ticket.
- **Database migrations** — Schema defined in planning; migration scripts deferred to implementation phase.
- **Production PDF generation** — Approach defined; final implementation deferred.
- **White-label UI customization portal** — Architecture supports white-labeling; UI for managing it is future scope.

---

## 4. AIA Template and Licensing Considerations

> **This is the most critical legal/compliance consideration in the entire feature.**

### Background

The AIA (American Institute of Architects) G702 and G703 forms are **copyrighted** documents. The specific layout, field labels, section titles, boilerplate legal text, and formatting of the official AIA forms are protected by copyright. Reproducing them without a license is infringement.

### What This Means for JBS

JBS does not currently hold a license to use official AIA form templates. As a result, this tool **must not**:
- Reproduce the official AIA G702 or G703 form layout.
- Copy AIA-specific section headers, boilerplate text, or signature blocks verbatim.
- Display the "AIA Document G702" or "AIA Document G703" form name or document number on any generated output.
- Claim that the output is an "AIA form."

### Recommended Path — Choose One Before Implementation

**Option A: Obtain an AIA License (Recommended if the client wants official AIA output)**

The AIA offers digital license access to official form templates via [AIA Contract Documents](https://www.aiacontracts.org/). A licensed integration allows generation of official G702/G703 PDFs. This is the "gold standard" for GC/owner acceptance. JBS should consult their attorney and the AIA licensing team before this route is taken.

**Option B: JBS-Branded Payment Application PDF (Recommended for v1)**

Generate a JBS-branded "Application for Payment" document that captures the same *business data* as G702/G703 — contract values, billing period, retainage, continuation line items — but uses original JBS-branded layout, original field labels written from scratch, and no AIA boilerplate.

Most GCs and owners accept well-formatted payment applications regardless of whether they use the official AIA form. The data is what matters in practice.

**Recommendation for v1:** Build with Option B. The PDF is labeled "JBS Application for Payment" (or similar). The document is designed to contain all the data a GC needs to process a subcontractor payment. If JBS later obtains an AIA license, the backend can generate official AIA output while the frontend form stays the same.

### What the Plan Assumes

This plan proceeds on the assumption of **Option B** for v1: a JBS-branded PDF with no AIA copyrighted content. The client must confirm this decision before implementation begins.

---

## 5. Recommended v1 Scope

### What Gets Built

- A new page at `/client-portal/payment-application` on `buildwithjbs.com`.
- A multi-step React form (embedded in Astro) covering all required fields.
- A review/summary step before payment.
- Stripe Checkout session creation via a serverless function or backend API endpoint.
- Post-payment: database record creation, PDF generation, download delivery, and email copy to JBS/AP.
- A JBS-branded PDF generated server-side using a PDF library.
- Temporary, signed download link for the PDF (not a permanent public URL).

### What Does Not Get Built

Everything in [Section 3](#3-out-of-scope-for-v1).

### Design Principle

The form and PDF use the **existing JBS visual language**: dark theme (`bg-jbs-dark`), `text-jbs-blue` accents, `font-heading` uppercase labels, `FadeInSection` scroll animations, `Navbar` and `Footer` components. The experience should feel native to the JBS client portal, not like a bolted-on third-party tool.

---

## 6. User Flow

### v1 No-Login Flow (Current Target)

```
[1] Subcontractor visits buildwithjbs.com
         │
         ▼
[2] Navigates to: Client Portal → Payment Application
    (or direct link: /client-portal/payment-application)
         │
         ▼
[3] Step 1 — Company & Contact Info
    (name, company, email, phone, address)
         │
         ▼
[4] Step 2 — Project & Contract Info
    (project name/number, owner, GC/contractor, application number,
     period of application, contract date, contract values, retainage)
         │
         ▼
[5] Step 3 — Continuation Sheet (G703-equivalent)
    (line-item table: SOV items with scheduled value,
     work completed prior, work completed this period,
     materials stored, totals)
         │
         ▼
[6] Step 4 — Application Summary (read-only review)
    Auto-calculated totals shown:
    - Total Completed and Stored to Date
    - Retainage Amount
    - Total Earned Less Retainage
    - Less Previous Certificates
    - Current Payment Due
    - Balance to Finish
         │
         ▼
[7] Step 5 — Payment ($9.99)
    "Pay $9.99 and Generate Your Application"
    → Stripe Checkout opens (or Payment Element embedded)
         │
         ▼
[8] Stripe confirms payment
    → Stripe webhook fires → backend records payment
         │
         ▼
[9] Backend:
    - Stores submission record in database (status: paid)
    - Generates JBS-branded PDF
    - Sends copy to JBS/AP email
    - Sends confirmation + download link to subcontractor email
         │
         ▼
[10] Subcontractor lands on success page
     - Download button (time-limited signed URL, e.g., 24 hours)
     - Confirmation: "A copy has been sent to your email"
     - Note: "JBS has received a copy for their records"
         │
         ▼
[11] Submission persists in database for admin review
```

### Future Login/Account Flow (v2+)

```
[1] Subcontractor logs in (or creates account)
[2] Dashboard shows previous submissions
[3] Pre-fills company info from profile
[4] New application → same form flow
[5] After payment → submission linked to account
[6] Historical PDFs accessible from dashboard (signed links refreshed on demand)
[7] JBS admin portal shows all submissions filterable by company/project
```

---

## 7. Form Sections and Fields

### Section A — Company and Contact Information

| Field | Type | Required | Notes |
|---|---|---|---|
| Subcontractor Company Name | Text | ✓ | |
| Contact Name | Text | ✓ | |
| Email Address | Email | ✓ | Used to deliver PDF copy |
| Phone Number | Tel | ✓ | |
| Address Line 1 | Text | ✓ | |
| Address Line 2 | Text | | Suite/unit |
| City | Text | ✓ | |
| State | Select | ✓ | US states |
| ZIP Code | Text | ✓ | |

### Section B — Project and Contract Information

| Field | Type | Required | Notes |
|---|---|---|---|
| Project Name | Text | ✓ | |
| Project Number | Text | | GC-assigned project number |
| Owner / Client | Text | ✓ | Owner of the project |
| Contractor (GC) | Text | ✓ | JBS or other GC |
| Contract Date | Date | ✓ | Original contract execution date |
| Application Number | Number | ✓ | Incrementing per project |
| Period To (Billing Period End) | Date | ✓ | End of billing period |

### Section C — Contract Value Summary

> Auto-calculated fields are computed from continuation sheet (Section D) data.

| Field | Type | Calculated? | Notes |
|---|---|---|---|
| Original Contract Sum | Currency | No | Entered by subcontractor |
| Net Change by Change Orders | Currency | No | Sum of approved change orders |
| Contract Sum to Date | Currency | Yes | Original + Net Change |
| Total Completed and Stored to Date | Currency | Yes | From continuation sheet |
| Retainage % | Percent | No | e.g., 10% |
| Retainage Amount | Currency | Yes | Total × Retainage % |
| Total Earned Less Retainage | Currency | Yes | Total − Retainage |
| Less Previous Certificates for Payment | Currency | No | Entered by subcontractor |
| Current Payment Due | Currency | Yes | Earned Less Retainage − Previous Certificates |
| Balance to Finish Including Retainage | Currency | Yes | Contract Sum to Date − Total Completed |

### Section D — Continuation Sheet (Schedule of Values / Line Items)

Repeating row table. Each row represents a line item from the Schedule of Values (SOV).

| Column | Type | Calculated? | Notes |
|---|---|---|---|
| Item No. | Text | No | e.g., 01, 02, 03 |
| Description of Work | Text | No | e.g., "Rough Framing" |
| Scheduled Value | Currency | No | Budgeted value for this item |
| Work Completed — From Previous Application | Currency | No | Carried over from prior app |
| Work Completed — This Period | Currency | No | New work billed this period |
| Materials Presently Stored | Currency | No | Stored on site, not yet installed |
| Total Completed and Stored to Date | Currency | Yes | Sum of prior + this period + stored |
| % Complete | Percent | Yes | (Total / Scheduled Value) × 100 |
| Balance to Finish | Currency | Yes | Scheduled Value − Total Completed |
| Retainage | Currency | Yes | Total × Retainage % |

**UX Note:** The continuation sheet should allow adding/removing rows dynamically. A minimum of one row is required. Consider a "Add Row" button and row-level delete. On mobile, consider a card-per-row layout instead of a horizontal table.

### Section E — Change Order Summary (Optional in v1)

| Field | Type | Notes |
|---|---|---|
| Change Order No. | Text | |
| Description | Text | |
| Amount | Currency | |
| Date Approved | Date | |

This section is optional in v1. The net change total feeds into Section C.

### Section F — Certification and Acknowledgment

A plain-language acknowledgment (not legal language) that the subcontractor confirms the information is accurate to the best of their knowledge. This is a checkbox, not a signature block with legal language. Example:

> "I confirm that the information entered in this application is accurate and complete to the best of my knowledge."

No notarization, legal signature, or notary language should be included.

---

## 8. Architecture Overview

### Current Infrastructure

| Layer | Technology | Platform |
|---|---|---|
| Frontend | Astro 5 + React 19 + Tailwind CSS 4 | Vercel (`buildwithjbs.com`) |
| Backend API | Go / Gin + PostgreSQL | Railway (`api.buildwithjbs.com`) |
| Email | TBD (see open questions) | TBD |
| File Storage | TBD (see open questions) | TBD |
| Payments | Stripe (not yet integrated) | Stripe |

### v1 Architecture Diagram

```
buildwithjbs.com (Vercel — Astro/React)
─────────────────────────────────────────────────────────────────
  /client-portal/payment-application
  └── Multi-step React form (client:load island)
       │
       │ POST /api/payment-application/create-session
       ▼
api.buildwithjbs.com (Railway — Go/Gin)
─────────────────────────────────────────────────────────────────
  POST /api/payment-application/create-session
  └── Validate form data
  └── Create Stripe Checkout session
  └── Store draft submission (status: pending_payment)
  └── Return Stripe Checkout URL
       │
       │ Stripe redirects to success URL
       ▼
  POST /api/stripe/webhook
  └── Verify Stripe webhook signature (CRITICAL — required)
  └── On checkout.session.completed:
       ├── Update submission status: paid
       ├── Enqueue PDF generation job
       └── Return 200 OK to Stripe

  PDF Generation Worker (sync or async goroutine/queue)
  └── Render JBS-branded PDF from submission data
  └── Upload PDF to storage (R2 / S3 / Supabase Storage)
  └── Generate signed download URL (24-hour TTL)
  └── Send email to subcontractor: confirmation + download link
  └── Send email to JBS/AP: copy of PDF + submission data
  └── Update submission record: status: complete, pdf_url: (internal)
       │
       ▼
buildwithjbs.com/client-portal/payment-application/success?session_id=xxx
  └── Frontend polls or receives confirmation
  └── Shows download button (signed URL passed from backend)
```

### Why the Existing Backend

The `jbs-internal-portal` Go backend at `api.buildwithjbs.com` is the right home for this feature. It already has:
- PostgreSQL database (Railway)
- Established API patterns
- Audit logging infrastructure (from ACH vendor portal)
- Deployment pipeline (Railway)

New endpoints and a new database table are added; no new service is needed.

### Serverless Function Consideration

Vercel supports serverless functions (API routes in Astro with SSR enabled). However:
- The existing backend already handles sensitive operations for this project.
- Stripe webhook verification, PDF generation, email sending, and database writes should live in the Go backend for consistency, security, and testability.
- Keeping business logic out of Vercel functions avoids cold-start issues for PDF generation.

**Recommendation:** All server-side logic (Stripe, PDF, email, database) runs through `api.buildwithjbs.com`. The Astro frontend is a pure client that calls the backend API.

### Astro SSR Consideration

The current `astro.config.mjs` has no output adapter configured, meaning the site builds as static HTML by default. The payment application page is a React island (`client:load`) — the form is fully client-side, which works with the static build. No SSR adapter is needed for v1 if:
- Form rendering is client-side React.
- API calls go to the backend directly from the browser (CORS configured).
- Stripe redirect happens via Stripe-hosted Checkout (no server-side rendering of payment UI needed).

If Stripe Payment Element (embedded) is chosen instead, the same approach applies — the Payment Element mounts in the React island.

---

## 9. Stripe Payment Flow

### Recommended Approach: Stripe Checkout (Hosted)

For v1, **Stripe Checkout** (hosted redirect) is recommended over the embedded Payment Element because:
- Stripe Checkout handles PCI compliance entirely on Stripe's side.
- No card data ever touches JBS servers or the JBS frontend.
- Implementation is simpler and faster.
- Stripe Checkout handles Apple Pay, Google Pay, saved cards automatically.

### Flow

1. User completes the form and clicks "Pay $9.99."
2. Frontend sends form data to `POST api.buildwithjbs.com/api/payment-application/create-session`.
3. Backend validates data, stores a `pending_payment` record, and creates a Stripe Checkout Session:
   - `line_items`: 1 × "JBS Application for Payment" @ $9.99
   - `success_url`: `https://buildwithjbs.com/client-portal/payment-application/success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url`: `https://buildwithjbs.com/client-portal/payment-application?cancelled=true`
   - `metadata`: `{ submission_id: "..." }`
4. Backend returns the Checkout session URL.
5. Frontend redirects to Stripe.
6. Stripe handles payment collection.
7. On success, Stripe redirects to the `success_url`.
8. Stripe fires a `checkout.session.completed` webhook to `api.buildwithjbs.com/api/stripe/webhook`.
9. Backend verifies the webhook signature, marks submission as paid, generates PDF, sends emails.
10. Success page polls `GET /api/payment-application/status/:session_id` until status is `complete`, then shows the download button.

### Important: Webhook Signature Verification

Stripe webhooks **must** be verified using the Stripe webhook signing secret. Never process a webhook without verifying the `Stripe-Signature` header. This prevents forged payment confirmations.

### Stripe Configuration Notes (Not Implemented Yet)

The following must be configured before going live:
- Stripe account set up under JBS business entity.
- Live and test API keys stored as environment variables (never committed to source).
- Webhook endpoint registered in Stripe dashboard with the correct signing secret.
- Stripe product and price configured for "Application for Payment" @ $9.99.
- CSP header in `vercel.json` updated to allow `js.stripe.com` and `*.stripe.com`.

---

## 10. Database and Storage Model

### Submissions Table (Conceptual Schema)

```sql
-- Table: payment_application_submissions
-- All monetary values stored as integers (cents) to avoid floating point issues.

id                          UUID PRIMARY KEY
created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
status                      TEXT NOT NULL  -- pending_payment | paid | generating | complete | failed

-- Stripe
stripe_checkout_session_id  TEXT UNIQUE
stripe_payment_intent_id    TEXT
amount_paid_cents           INTEGER        -- 999 for $9.99
paid_at                     TIMESTAMPTZ

-- Subcontractor contact
sub_company_name            TEXT NOT NULL
sub_contact_name            TEXT NOT NULL
sub_email                   TEXT NOT NULL
sub_phone                   TEXT NOT NULL
sub_address_line1           TEXT NOT NULL
sub_address_line2           TEXT
sub_city                    TEXT NOT NULL
sub_state                   TEXT NOT NULL
sub_zip                     TEXT NOT NULL

-- Project
project_name                TEXT NOT NULL
project_number              TEXT
owner_name                  TEXT NOT NULL
contractor_name             TEXT NOT NULL
contract_date               DATE NOT NULL
application_number          INTEGER NOT NULL
period_to                   DATE NOT NULL

-- Contract values (cents)
original_contract_sum       BIGINT NOT NULL
net_change_orders           BIGINT NOT NULL DEFAULT 0
retainage_percent           NUMERIC(5,2) NOT NULL DEFAULT 10.00
previous_certificates       BIGINT NOT NULL DEFAULT 0

-- Continuation sheet (stored as JSONB)
line_items                  JSONB NOT NULL DEFAULT '[]'
-- Shape: [{ item_no, description, scheduled_value, prev_completed,
--            this_period, materials_stored, retainage_percent }]

-- PDF
pdf_storage_path            TEXT           -- internal path in storage bucket
pdf_download_token          TEXT           -- signed token for download link
pdf_download_expires_at     TIMESTAMPTZ

-- Change orders (stored as JSONB)
change_orders               JSONB NOT NULL DEFAULT '[]'
-- Shape: [{ number, description, amount, date_approved }]

-- Audit
ip_address                  TEXT           -- hashed or masked for privacy
user_agent                  TEXT
jbs_copy_sent_at            TIMESTAMPTZ
sub_copy_sent_at            TIMESTAMPTZ
```

### Storage for PDFs

Generated PDFs must not be served from a public URL permanently. Options:

| Option | Platform | Notes |
|---|---|---|
| **Cloudflare R2** | Cloudflare | S3-compatible, no egress fees, cheap storage. Recommended. |
| AWS S3 | AWS | Standard, reliable. Slightly more expensive for egress. |
| Supabase Storage | Supabase | Good if migrating to Supabase for DB too. |
| Railway Volumes | Railway | Not recommended for binary file storage. |

**Recommendation:** Cloudflare R2. Generate a pre-signed URL with a 24-hour TTL for each download. The internal `pdf_storage_path` is never exposed to the browser directly.

### Data Retention

Define a retention policy with the client before go-live. Recommendation:
- Submission metadata: retain indefinitely for AP records.
- PDF files: retain for 7 years (construction industry standard for project documentation).
- Download tokens: expire after 24 hours; subcontractor must contact JBS for a re-issue.

---

## 11. PDF Generation Approach

### Tooling Options (Go backend)

| Library | Language | Notes |
|---|---|---|
| **`go-pdf/fpdf`** | Go | Lightweight, no external dependencies, good for structured docs |
| **`chromedp` + HTML template** | Go | Renders HTML to PDF via headless Chrome — most design-flexible |
| **`wkhtmltopdf` wrapper** | Go | Mature but requires binary on server |
| **`unipdf`** | Go | Commercial, full-featured, supports AIA templates if licensed |

**Recommendation for v1:** HTML template → headless Chrome (`chromedp` or `go-rod`) approach. This allows the PDF layout to be designed in HTML/CSS (matching JBS brand), which is easier to maintain than low-level PDF drawing commands. Railway supports headless Chrome in Docker.

Alternatively, use `go-pdf/fpdf` for a fully self-contained, dependency-light solution at the cost of more manual layout code.

### PDF Document Content (JBS-Branded, Not AIA)

The generated PDF contains **original JBS-authored content only**:

**Page 1 — Application for Payment Summary**
- JBS logo and "Application for Payment" header
- Document date and unique submission ID
- Subcontractor and project information block
- Contract value summary table (all calculated totals)
- Certification checkbox acknowledgment text (original language)
- "Generated by JBS Construction Client Portal" footer
- "Not an official AIA document" disclaimer

**Page 2+ — Schedule of Values / Continuation Sheet**
- JBS-branded header repeated
- Line item table with all SOV columns
- Page numbers and document ID footer

### What the PDF Must NOT Include

- The phrase "AIA Document G702" or "AIA Document G703"
- Any text, boilerplate, legal language, or layout copied from official AIA forms
- Notary signature blocks or legal certification language

---

## 12. JBS / AP Copy Delivery Flow

After a successful payment and PDF generation:

1. **Subcontractor email** (sent immediately after PDF is ready):
   - Subject: `Your JBS Application for Payment — [Project Name] — Application #[N]`
   - Body: Confirmation, application summary, download link (24-hour TTL signed URL)
   - From: `noreply@buildwithjbs.com` or a configured transactional email address

2. **JBS/AP email** (sent simultaneously):
   - Subject: `New Payment Application Received — [Subcontractor] — [Project Name] — Application #[N]`
   - Body: Full submission details, all calculated totals, link to PDF (using an internal admin URL or long-lived signed URL)
   - PDF attached directly if size allows (< 5 MB typical)
   - To: Configured AP email address (environment variable — not hardcoded)

3. **Future (v2):** Internal portal notification queue visible in `jbs-internal-portal` admin UI.

### Email Service Options

| Service | Notes |
|---|---|
| **Resend** | Developer-friendly, simple API, good deliverability, generous free tier |
| **SendGrid** | Established, feature-rich, higher pricing |
| **Postmark** | Excellent deliverability for transactional email |
| **AWS SES** | Cheapest at scale; more setup friction |

**Recommendation:** Resend for v1. Consistent with modern Astro/Go stack tooling.

---

## 13. Backend and API Requirements

### New Endpoints (to be added to `jbs-internal-portal`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/payment-application/create-session` | Validate form data, store draft, create Stripe Checkout session, return session URL |
| `POST` | `/api/stripe/webhook` | Receive and verify Stripe events; trigger PDF generation and email on payment complete |
| `GET` | `/api/payment-application/status/:session_id` | Polled by success page to check if PDF is ready |
| `GET` | `/api/payment-application/download/:token` | Redirect to signed storage URL; validates token expiry |

### Future Endpoints (v2+)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/payment-application/admin` | List all submissions (auth required) |
| `GET` | `/api/payment-application/admin/:id` | Get full submission detail |
| `POST` | `/api/payment-application/admin/:id/resend` | Re-send PDF copy |
| `POST` | `/api/payment-application/download/:token/refresh` | Issue new 24-hour link (for expired downloads) |

### Input Validation Requirements

All form data submitted to the backend must be validated server-side regardless of client-side validation:
- Email: valid format
- Phone: valid US phone format
- ZIP: 5-digit or 5+4
- Monetary values: non-negative integers (cents); within realistic bounds (reject > $999,999,999)
- Retainage percent: 0–50%
- Application number: positive integer
- Line items: minimum 1 row; each row must have a description and scheduled value > 0
- Date fields: valid ISO dates; period_to must not be in the future by more than 90 days

### CORS Configuration

The backend must allow CORS from:
- `https://buildwithjbs.com` (production)
- `http://localhost:4321` (development)

Do not use wildcard (`*`) CORS in production.

---

## 14. Security and Privacy Considerations

### General

- **No Stripe secret keys in frontend code or source control.** Stripe Publishable Key only in frontend; Secret Key only in backend environment variables.
- **Webhook signature verification is mandatory.** Never process `checkout.session.completed` without verifying the `Stripe-Signature` header using the webhook signing secret.
- **Server-side validation required.** Client-side validation is UX only; never trust client data for business logic.
- **PDF signed URLs.** Generated PDFs are never served from a publicly guessable URL. All downloads use time-limited signed tokens.
- **No sensitive data in URL parameters.** Submission IDs in URLs are UUIDs (not sequential integers) to prevent enumeration.

### Privacy

- Email addresses and phone numbers are stored in the database but are not displayed publicly.
- The subcontractor's email is used only to deliver their copy and for re-issue requests. It is not used for marketing without opt-in.
- IP addresses, if stored for fraud prevention, should be hashed or masked to comply with privacy best practices.
- Define and document a data retention policy before going live.

### Current CSP Header — Required Updates

The `vercel.json` CSP header currently allows:
```
connect-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
form-action 'self'
```

Before Stripe integration, the CSP must be updated to include:
```
script-src  ... https://js.stripe.com
frame-src   https://js.stripe.com https://hooks.stripe.com
connect-src ... https://api.stripe.com
form-action ... https://checkout.stripe.com
```

Refer to the [Stripe CSP documentation](https://stripe.com/docs/security/guide#content-security-policy) for the current recommended directives.

### PCI Compliance

Using Stripe Checkout (hosted) keeps JBS at PCI SAQ A level (lowest complexity) — card data never touches JBS servers or frontend code. If the Payment Element (embedded) is used instead, the same PCI scope applies as long as no card data is handled by JBS code.

### Fraud / Abuse Considerations

- A $9.99 payment barrier itself reduces spam submissions.
- Stripe provides built-in fraud detection (Radar).
- Consider rate-limiting `/api/payment-application/create-session` by IP (e.g., 5 requests per hour per IP).
- Log all submissions with IP and user-agent for investigation if needed.

---

## 15. White-Label Architecture Notes

The client has indicated this feature should be architecturally portable for use by other construction clients. Key design decisions that support white-labeling:

### Tenant Identifier

Every database record and API call should carry a `tenant_id` (or `client_slug`) from day one. In v1, this is always `jbs`. In v2+, it allows routing, branding, and data isolation per client.

```sql
-- Add to payment_application_submissions
tenant_id   TEXT NOT NULL DEFAULT 'jbs'
```

### Branding Configuration

PDF template, email sender, AP email address, logo, and color palette should be driven by tenant configuration, not hardcoded. In v1, these are environment variables. In v2+, they are rows in a `tenants` table.

```
JBS_AP_EMAIL=ap@buildwithjbs.com
JBS_LOGO_URL=https://...
JBS_BRAND_COLOR=#0051A8
JBS_PORTAL_NAME=JBS Application for Payment
```

### Routing

All routes for this feature live under `/client-portal/payment-application` in the JBS site. For other clients, the same code can be deployed under their own domain's equivalent path. No JBS-specific strings should appear in the shared components or backend logic — only in configuration.

### Backend Service Isolation

The `jbs-internal-portal` backend handles JBS-specific data. For other construction clients using the same codebase:
- Either deploy the same Go service with different configuration and database credentials.
- Or add multi-tenancy to the existing service with row-level tenant isolation.

Multi-tenancy in the same service is more operationally efficient but requires careful data isolation. Separate deployments per client are simpler and safer for v1.

---

## 16. Files and Routes to Be Added

> These files do not exist yet. This section is a roadmap for the implementation phase.

### Frontend (`jbs-site`)

```
src/
  pages/
    client-portal/
      payment-application.astro          # Entry point / wrapper page
      payment-application/
        success.astro                    # Post-payment success + download page
        cancelled.astro                  # Cancelled payment / back to form
  components/
    PaymentApplication/
      PaymentApplicationForm.tsx         # Main multi-step form container
      steps/
        Step1Company.tsx                 # Company & contact fields
        Step2Project.tsx                 # Project & contract info
        Step3ContinuationSheet.tsx       # SOV line item table
        Step4Summary.tsx                 # Read-only calculated summary
        Step5Payment.tsx                 # Stripe redirect trigger
      LineItemRow.tsx                    # Single continuation sheet row
      CurrencyInput.tsx                  # Formatted currency input component
      FormProgress.tsx                   # Step indicator (1–5)
      ApplicationSummaryTable.tsx        # Reused on summary step and success page
```

### Backend (`jbs-internal-portal`)

```
internal/
  paymentapp/
    handler.go          # HTTP handlers for payment-application routes
    service.go          # Business logic (validation, PDF trigger, email)
    repository.go       # Database queries
    models.go           # Submission struct, line item types
    pdf.go              # PDF generation logic
    email.go            # Email composition and send
  stripe/
    webhook.go          # Stripe webhook handler (if not already present from ACH work)

cmd/
  server/
    main.go             # Register new routes (existing file, add routes)

migrations/
  YYYYMMDD_create_payment_application_submissions.sql
```

---

## 17. Verification and Testing Plan

### Unit Tests (Backend)

- Validation logic: test all field constraints (boundary values, invalid inputs).
- Monetary calculation: verify all auto-calculated totals (retainage, current payment due, etc.) against known inputs.
- PDF generation: generate a PDF from fixture data; assert non-zero file size and basic content presence.
- Stripe webhook handler: test with valid and invalid signatures; test handling of duplicate events (idempotency).
- Email service: mock the email client; assert correct recipient, subject, and attachment.

### Integration Tests (Backend)

- Full submission lifecycle: POST create-session → (simulate Stripe webhook) → assert status = complete, PDF stored, emails sent.
- Status polling endpoint: assert status transitions are correct.
- Download endpoint: assert token validation, expiry, and redirect behavior.

### Frontend Tests

- Multi-step form: test navigation forward/backward, field validation messages, auto-calculated field updates.
- Summary step: verify all calculated values match expected outputs from known inputs.
- Stripe redirect: verify that clicking "Pay" calls the correct API endpoint and redirects on success.
- Success page: verify download button appears when status is `complete`.

### Manual QA Checklist (Pre-Launch)

- [ ] Form fills out correctly on desktop (Chrome, Safari, Firefox).
- [ ] Form fills out correctly on mobile (iOS Safari, Android Chrome).
- [ ] All calculated fields update correctly as inputs change.
- [ ] Continuation sheet rows can be added and removed.
- [ ] Stripe Checkout opens in test mode with a Stripe test card.
- [ ] After test payment, success page shows download button.
- [ ] Generated PDF downloads successfully and contains correct data.
- [ ] PDF contains no AIA copyright text or form numbers.
- [ ] JBS/AP receives email copy with PDF attached.
- [ ] Subcontractor receives confirmation email with download link.
- [ ] Download link expires after 24 hours.
- [ ] Cancelled payment returns user to form without creating a completed submission.
- [ ] CSP headers do not block Stripe JS or Stripe Checkout redirect.
- [ ] No Stripe keys visible in browser source or network responses.

### Build Verification

Since this planning document adds no source code changes, `npm run build` is not required for this ticket. Run the build only when source files under `src/` are modified.

---

## 18. Future Enhancements

| Feature | Notes |
|---|---|
| Login / User Accounts | Subcontractors log in, see submission history, re-download past PDFs |
| Admin Review Dashboard | JBS/AP reviews, approves, or flags submissions in the internal portal |
| AIA Licensed Templates | If JBS obtains AIA license, swap PDF generator to produce official G702/G703 |
| Owner/Client Invoicing | Generate billing applications from GC to owner (separate feature, separate scope) |
| Lien Waiver Generation | Conditional and unconditional lien waivers on completion/payment |
| Retainage Release Certificate | Separate document type for final payment applications |
| Subcontractor Pre-Qualification | Extend the existing questionnaire flow to include financial pre-qual tied to submissions |
| Multi-Project Dashboard | Subcontractor sees all their applications across projects |
| Change Order Approval Workflow | JBS approves change orders in the portal; approved CO numbers pre-populate applications |
| JBS Internal Portal Integration | Submissions visible and searchable in `jbs-internal-portal` admin dashboard |
| White-Label Rollout | Deploy same system for other construction GC clients |
| Stripe Revenue Dashboard | JBS-facing revenue reporting for the $9.99 fee stream |
| Bulk Download / Export | JBS AP exports all submissions for a project as a ZIP or CSV |

---

## 19. Open Questions for the Client

The following items require client input before implementation begins:

| # | Question | Why It Matters |
|---|---|---|
| 1 | **AIA License Decision:** Will JBS pursue an official AIA license, or proceed with a JBS-branded "Application for Payment" PDF? | Determines PDF content and legal exposure. Must be resolved before any PDF work begins. |
| 2 | **AP Email Address:** What email address(es) should receive the JBS copy of every submission? | Required for email delivery configuration. |
| 3 | **Stripe Account:** Does JBS have an existing Stripe account, or does one need to be created? | Required to configure payment processing. |
| 4 | **Subcontractor Communication:** Should the tool be announced to existing subcontractors, and if so, how? | Affects launch plan and adoption. |
| 5 | **Data Retention Policy:** How long should submission records and PDF files be retained? | Required before storage configuration. |
| 6 | **$9.99 Fee Ownership:** Does the $9.99 go directly to JBS, or is there a revenue share with a platform/white-label partner? | Affects Stripe Connect vs. direct charge architecture. |
| 7 | **Download Link Expiry:** Is 24 hours acceptable for PDF download links? Should subcontractors be able to request a re-issue? | Affects UX and support burden. |
| 8 | **Re-download Policy:** After 24 hours, can a subcontractor contact JBS to get a new link? Who handles that? | Affects support workflow. |
| 9 | **Retainage Default:** Is there a standard retainage percentage JBS subcontracts use (e.g., 10%)? Should it default to 10%? | UX convenience. |
| 10 | **GC Name on Form:** Should "Contractor (GC)" default to "JBS Construction" or be free-form (for white-label readiness)? | Affects default values and white-label config. |
| 11 | **Application Number Management:** Should the system auto-increment application numbers per project, or should subcontractors enter them manually? | Auto-increment requires project tracking; manual is simpler for v1. |
| 12 | **Mobile Priority:** Is mobile form-filling a first-class requirement (subs filling out on a job site phone) or secondary? | Affects UI complexity of the continuation sheet table. |

---

## 20. Recommended Implementation Phases

### Phase 1 — Foundation (Current Planning Ticket)

- [x] Inspect existing site structure
- [x] Create this planning document
- [ ] Client reviews and approves plan
- [ ] Client answers open questions (Section 19)
- [ ] AIA license decision confirmed (Section 4)

### Phase 2 — Backend Infrastructure

- [ ] Add `payment_application_submissions` table migration to `jbs-internal-portal`
- [ ] Implement `POST /api/payment-application/create-session` (form validation + Stripe session)
- [ ] Implement `POST /api/stripe/webhook` (signature verification + status update)
- [ ] Implement `GET /api/payment-application/status/:session_id`
- [ ] Configure Stripe test environment (test keys in `.env`, never committed)
- [ ] Configure PDF storage bucket (Cloudflare R2 or equivalent)
- [ ] Configure email service (Resend recommended)
- [ ] Write and pass unit and integration tests for all new endpoints

### Phase 3 — PDF Generation

- [ ] Design JBS-branded "Application for Payment" PDF template (HTML/CSS or code)
- [ ] Legal review of PDF content (confirm no AIA copyright issues)
- [ ] Implement PDF generation in Go backend
- [ ] Implement signed URL generation and `GET /api/payment-application/download/:token`
- [ ] Test PDF output with fixture data

### Phase 4 — Frontend Form

- [ ] Create `src/pages/client-portal/payment-application.astro`
- [ ] Build multi-step form React components (Steps 1–5)
- [ ] Implement all auto-calculated fields with real-time updates
- [ ] Build continuation sheet line-item table (add/remove rows)
- [ ] Build review/summary step
- [ ] Wire Stripe Checkout redirect
- [ ] Create success and cancelled pages
- [ ] Update `vercel.json` CSP headers for Stripe
- [ ] Run `npm run build` and verify no build errors

### Phase 5 — Integration and QA

- [ ] End-to-end test with Stripe test cards
- [ ] Verify email delivery to AP and subcontractor
- [ ] Verify PDF download and content
- [ ] Complete manual QA checklist (Section 17)
- [ ] Security review (CSP, CORS, webhook verification, signed URLs)
- [ ] Cross-browser and mobile testing

### Phase 6 — Launch

- [ ] Configure Stripe live keys in Railway environment
- [ ] Configure AP email address in Railway environment
- [ ] Final legal/compliance review of PDF content
- [ ] Announce to JBS subcontractor network
- [ ] Monitor first submissions and PDF delivery

### Phase 7 — v2 Planning (Post-Launch)

- [ ] Review submission volume and support requests
- [ ] Prioritize from future enhancements list (Section 18)
- [ ] Evaluate AIA license if subcontractor adoption indicates demand

---

## References

- [AIA Contract Documents — Licensing](https://www.aiacontracts.org/)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhook Signature Verification](https://stripe.com/docs/webhooks/signatures)
- [Stripe Content Security Policy Guide](https://stripe.com/docs/security/guide#content-security-policy)
- Related: `docs/ACH_VENDOR_PORTAL_PLAN.md` — Phase 1 of the JBS Client Portal (ACH secure submission)

---

*This document represents the planning phase only. No Stripe keys, database migrations, production PDFs, or source code changes are included in this ticket. All implementation decisions are subject to client approval and legal review of PDF content.*
