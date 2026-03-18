# ACH Vendor Portal — Technical Implementation Plan

**Project:** JBS Construction — Secure ACH Submission System  
**Date:** March 2026  
**Scope:** Phase 1 of the JBS Client Portal  
**Public Site:** https://buildwithjbs.com (Vercel)  
**Backend API:** https://api.buildwithjbs.com (Railway)  

---

## Background

A subcontractor's email was compromised and fraudulent ACH banking information was submitted in their name — a Business Email Compromise (BEC) attack. JBS nearly paid a large sum to a fraudulent account.

**Root cause:** Email has no chain of custody. Anyone who compromises a mailbox can inject fraudulent bank information and it looks identical to a legitimate message.

**Solution:** Remove ACH collection from email entirely. Replace it with an invite-only, token-based submission portal where subcontractors submit bank info through a verified channel, and accounting reviews/approves it before it ever enters the payment system.

---

## Scope Decision: Part of the Future Client Portal

This feature is built as **Phase 1 of the JBS Client Portal**, not a standalone tool.

The `jbs-site` will gain a `/vendor/...` route namespace that becomes the shell for all future external-facing features. The backend patterns, encryption service, and audit log infrastructure built here are reusable for client-facing features (invoice review, change order approvals, document uploads, etc.) added later.

Building it this way means no throwaway work — every line serves the longer roadmap.

---

## System Architecture

```
jbs-site (Astro + React)                       jbs-internal-portal (Go/Gin + Postgres)
buildwithjbs.com — Vercel                      api.buildwithjbs.com — Railway
─────────────────────────────────────          ──────────────────────────────────────
buildwithjbs.com/vendor/submit?token=xxx ─────▶ POST api.buildwithjbs.com/api/vendor/ach/submit
buildwithjbs.com/vendor/confirm          ◀───── (token validated, data encrypted + stored)
buildwithjbs.com/vendor/expired                           │
                                                 ▼
                           GET  /api/vendor/ach/pending    (finance role only)
                           PUT  /api/vendor/ach/:id/approve
                           PUT  /api/vendor/ach/:id/reject
                                                 │
                           POST /api/vendor/invite          (creates invite token)
                           GET  /api/vendor/invite/validate?token=xxx
```

The backend is the **same** `jbs-internal-portal` Go server — new endpoints only. No new service to deploy.

---

## User Flows

### New Subcontractor — First Time Setup

1. JBS accounting adds them in the internal portal (name, company, email, phone)
2. System sends a plain-language email + SMS:
   > *"Hi Mike — JBS Construction needs your payment info to set you up in our system. Click here to securely submit your bank details. This link expires in 72 hours."*
3. Subcontractor clicks the link — **no login, no account creation required**
4. They fill out a simple branded form:
   - Name / Company (pre-filled from what JBS entered)
   - Routing number
   - Account number (entered twice to confirm)
   - Account type (checking or savings)
   - Checkbox: "I confirm this is my business account"
5. They submit and receive confirmation
6. Accounting team reviews and approves in the internal portal

**Subcontractors never need to:** create a username or password, download an app, remember anything, or navigate a dashboard. The secure link is their credential — single-use, time-limited, and tied to their identity.

### Existing Subcontractor — ACH Change Request (Highest Risk)

This is the exact attack vector that was exploited. Extra friction is intentional here.

1. Change request initiated (by the subcontractor calling JBS, or JBS accounting)
2. System sends a secure link to the email on file **and** an SMS code to the phone on file
3. Subcontractor enters the SMS code on the page, then submits new ACH info
4. Accounting receives a flagged notification:
   > *"ACCOUNT CHANGE REQUEST — Mike Davis / Davis Electrical submitted new bank info. Previous account ending 4821. New account ending 7734. Requires your approval before activation."*
5. Accounting calls the subcontractor at the **phone number already on file** to verbally confirm (out-of-band — this is the step that stops the fraud)
6. Accounting approves in the portal

### Accounting Team View

A review queue in the internal portal:

| Subcontractor | Submitted | Type | Action |
|---|---|---|---|
| Davis Electric | Today 2:14 PM | NEW | Review |
| Peak Plumbing | Today 9:01 AM | CHANGE ⚠ | Review |
| Apex Roofing | Yesterday | NEW | Approve / Deny |

- Changes flagged with a warning icon requiring extra scrutiny
- Only masked account info visible on screen (last 4 digits only)
- Submission metadata shown: IP address, timestamp, device/browser
- Approve / Reject with optional notes
- Full audit log: who approved what and when

---

## Backend — Go/Gin Changes

### New Database Migrations

**Migration 020 — `vendors` table**
```sql
CREATE TABLE vendors (
  id           SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  phone        VARCHAR(50),
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

**Migration 021 — `vendor_invites` table**
```sql
CREATE TABLE vendor_invites (
  id          SERIAL PRIMARY KEY,
  vendor_id   INTEGER REFERENCES vendors(id),
  token       VARCHAR(128) NOT NULL UNIQUE,  -- 64-byte hex, cryptographically random
  token_type  VARCHAR(20) NOT NULL,          -- 'new_submission' | 'change_request'
  expires_at  TIMESTAMP NOT NULL,            -- 72 hours from creation
  used_at     TIMESTAMP,                     -- null until consumed
  created_by  INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON vendor_invites(token);
```

**Migration 022 — `vendor_ach_submissions` table**
```sql
CREATE TABLE vendor_ach_submissions (
  id                SERIAL PRIMARY KEY,
  vendor_id         INTEGER REFERENCES vendors(id),
  invite_id         INTEGER REFERENCES vendor_invites(id),
  routing_number    BYTEA NOT NULL,           -- AES-256-GCM encrypted
  account_number    BYTEA NOT NULL,           -- AES-256-GCM encrypted
  account_type      VARCHAR(20) NOT NULL,     -- 'checking' | 'savings'
  account_last4     VARCHAR(4) NOT NULL,      -- plaintext, for display only
  routing_last4     VARCHAR(4) NOT NULL,      -- plaintext, for display only
  status            VARCHAR(20) DEFAULT 'pending',  -- pending | approved | rejected
  submission_ip     INET,
  submission_ua     TEXT,
  submitted_at      TIMESTAMP DEFAULT NOW(),
  reviewed_by       INTEGER REFERENCES users(id),
  reviewed_at       TIMESTAMP,
  review_notes      TEXT
);
```

**Migration 023 — `vendor_ach_audit_log` table**
```sql
CREATE TABLE vendor_ach_audit_log (
  id             SERIAL PRIMARY KEY,
  submission_id  INTEGER REFERENCES vendor_ach_submissions(id),
  vendor_id      INTEGER REFERENCES vendors(id),
  action         VARCHAR(50) NOT NULL,  -- 'submitted' | 'viewed' | 'approved' | 'rejected' | 'change_requested'
  performed_by   INTEGER REFERENCES users(id),  -- null for vendor-side actions
  ip_address     INET,
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

---

### New Service — Encryption

**File:** `internal/services/encryption.go`

- AES-256-GCM encrypt/decrypt
- Key loaded from `ACH_ENCRYPTION_KEY` environment variable (32-byte base64 encoded)
- Routing and account numbers encrypted before any DB write
- Raw numbers never decrypted for display — only last 4 digits stored in plaintext
- Decryption only used when accounting exports to their payment system, with a corresponding audit log entry

---

### New API Endpoints

**File:** `internal/handlers/vendor_ach.go`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/vendor` | finance role | Create vendor + send invite email |
| `GET` | `/api/vendor` | finance role | List all vendors |
| `GET` | `/api/vendor/invite/validate` | none (token in query) | Validate invite token, return pre-fill data |
| `POST` | `/api/vendor/ach/submit` | none (token in body) | Submit ACH info |
| `GET` | `/api/vendor/ach/pending` | finance role | Pending review queue |
| `PUT` | `/api/vendor/ach/:id/approve` | finance role | Approve submission |
| `PUT` | `/api/vendor/ach/:id/reject` | finance role | Reject with notes |
| `POST` | `/api/vendor/:id/request-change` | finance role | Trigger change request invite |
| `GET` | `/api/vendor/ach/audit` | executive / finance | Full audit log |

Public endpoints (`validate`, `submit`) require no JWT — the time-limited token is the credential. Token is validated, checked for expiry, and marked used atomically in a single transaction.

---

### Role Access

Reuse the existing `finance` role for ACH review access. No new roles needed for Phase 1.

---

## Frontend Changes

### A. jbs-site (Astro + React) — External-Facing Pages

New pages:
```
src/pages/vendor/
  submit.astro     ← ACH form; reads ?token= from URL
  confirm.astro    ← success / thank you page
  expired.astro    ← shown if token is invalid or expired
```

New component: `src/components/VendorAchForm.tsx` (React, renders client-side)

- Calls `/api/vendor/invite/validate?token=xxx` on mount to verify token and pre-fill name/company
- Routing number + account number fields with real-time validation
- Account number entered twice (confirm field with match check)
- Account type radio (checking / savings)
- Confirmation checkbox
- On submit: POST to `/api/vendor/ach/submit` with token + form data
- On success: redirect to `/vendor/confirm`
- On expired/invalid token: redirect to `/vendor/expired`
- Fully mobile-responsive — most subcontractors will use a phone

This `/vendor/...` section becomes the **shell for the future client portal**. Same layout, same auth infrastructure — new routes added as features are built.

### B. jbs-internal-portal Frontend — Accounting Workflow

New page: `src/pages/vendors.astro`
- List of all vendors with status and last submission date
- "Add Vendor + Send Invite" button → creates vendor and fires invite email
- "Request ACH Change" button for existing vendors with approved ACH on file

New page: `src/pages/ach-review.astro`
- Pending queue with NEW vs CHANGE ⚠ flags
- Review slide-out: masked account info, submission metadata (IP, timestamp, browser)
- Approve / Reject with optional notes field
- Submission history per vendor (shows previous account last-4 with timestamps)

---

## Email Templates

Reuse the existing SMTP pattern from `internal/handlers/invite.go`.

**Vendor invite email:**
- Plain language, mobile-friendly HTML
- Contains the secure submission link
- States the link expires in 72 hours
- Zero technical jargon — reads like a letter from JBS

**Accounting notification email (on submission):**
- Fires when a vendor submits
- Contains **zero ACH data** — just vendor name, submission time, and a link to the review queue
- Change requests get a `⚠ CHANGE REQUEST` subject prefix

---

## Security Requirements

| Requirement | Implementation |
|---|---|
| ACH data never transmitted via email | Portal only; notifications contain zero account data |
| Encryption at rest | AES-256-GCM; encryption key in env var, never hardcoded |
| Tokens are single-use | `used_at` set atomically on first consumption |
| Tokens expire | 72-hour window; checked on every use |
| No raw account numbers ever displayed | Only last 4 digits stored in plaintext for display |
| Every action logged | `vendor_ach_audit_log` table with IP, timestamp, actor |
| Public endpoints rate-limited | Gin middleware — 10 requests/min per IP |
| CORS locked to buildwithjbs.com | Public ACH endpoints reject requests from other origins |
| Change requests require SMS (Phase 2) | Twilio integration — hardened in Phase 2 |
| Out-of-band phone confirmation for changes | Policy enforcement — accounting calls known number before approving any change |

---

## The Policy That Makes This Work

The portal is only as effective as the policy enforced around it.

**JBS must enforce:** No ACH information will be accepted by email, phone dictation, fax, or any other method — only through the secure portal.

If a subcontractor says their link expired, the response is: *"We'll send you a new link right now."* Never an exception. Every exception is a potential attack vector.

---

## Implementation Build Order

1. **DB migrations** (020–023) — everything depends on these
2. **Encryption service** — needed before any ACH data can be stored
3. **Backend handlers** — invite creation and token validation first, then ACH submit, then review/approve endpoints
4. **Email templates** — invite email + accounting notification
5. **jbs-site pages** — submit form, confirm page, expired page
6. **Internal portal pages** — vendors list + ACH review queue
7. **End-to-end test** — full flow: create vendor → send invite → submit ACH → accounting approves

---

## Phased Rollout

### Phase 1 — Core Protection *(addresses the immediate risk)*
- Invite/token system for vendors
- ACH submission form on jbs-site
- Accounting review and approval queue
- Encrypted storage of routing/account numbers
- Full audit log

### Phase 2 — Hardening
- SMS two-factor verification required for all ACH change requests
- Change history with before/after masked account details
- Automatic re-verification prompts on a configurable schedule (e.g., annually)
- Rate limiting and anomaly alerting

### Phase 3 — Optional Advanced Verification
- Plaid Link integration — vendor connects their bank directly via OAuth
- Instant account ownership verification
- Eliminates possibility of fabricated account numbers entirely
- Plaid stores the bank reference token; JBS never handles raw credentials

---

## Future Client Portal Extension

Once Phase 1 is live, the `/vendor/` section of jbs-site expands into a full client portal:

| Route | Feature | Phase |
|---|---|---|
| `/vendor/submit` | ACH submission (subcontractors) | Phase 1 ✓ |
| `/client/login` | Persistent accounts for job owners | Future |
| `/client/invoices` | View and approve invoices | Future |
| `/client/documents` | Upload/download contracts and change orders | Future |
| `/client/ach` | Same ACH flow, client role | Future |

The backend encryption service, audit log, token system, and email infrastructure built in Phase 1 are all reused. Nothing gets rebuilt.

---

## Environment Variables Required

Add to `jbs-internal-portal` backend `.env`:

```
# ACH encryption key — 32 random bytes, base64 encoded
# Generate with: openssl rand -base64 32
ACH_ENCRYPTION_KEY=

# Vendor portal base URL
VENDOR_PORTAL_URL=https://buildwithjbs.com

# CORS — allow requests from the public site
CORS_ALLOWED_ORIGIN=https://buildwithjbs.com

# Twilio (Phase 2 only)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

---

## Open Questions Before Build

1. **Accounting software integration** — Does JBS use QuickBooks, Sage, or similar? If yes, verified ACH data could flow in automatically rather than requiring manual re-entry.
2. **Number of active vendors** — Roughly how many subcontractors are in the system at one time? Affects pagination and queue design.
3. **API subdomain** — Need to configure `api.buildwithjbs.com` as a custom domain in Railway pointing at the `jbs-internal-portal` backend. DNS record added at their registrar.
4. **SMS requirement for Phase 1** — Do you want SMS on new submissions as well, or only on change requests?
