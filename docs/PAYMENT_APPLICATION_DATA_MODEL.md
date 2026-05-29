# Payment Application — Database Schema & Data Model

**Project:** JBS Construction — Subcontractor Payment Application Tool  
**Branch:** `feature/jbs-payment-application-data-model`  
**Date:** May 2026  
**Status:** Docs-First / Pre-Implementation — No migrations applied  
**Relates to:** `AIA_G702_G703_GENERATOR_PLAN.md`, `AIA_GENERATOR_IMPLEMENTATION_TICKETS.md` TICKET-005  

---

## Table of Contents

1. [Decision: Relational vs JSONB](#1-decision-relational-vs-jsonb)
2. [Tables Overview](#2-tables-overview)
3. [Table: `pa_tenants`](#3-table-pa_tenants)
4. [Table: `payment_applications`](#4-table-payment_applications)
5. [Table: `payment_application_change_orders`](#5-table-payment_application_change_orders)
6. [Table: `payment_application_line_items`](#6-table-payment_application_line_items)
7. [Status Enums](#7-status-enums)
8. [Relationships Diagram](#8-relationships-diagram)
9. [Indexes](#9-indexes)
10. [Validation Rules](#10-validation-rules)
11. [Stored Calculated Totals — Rationale](#11-stored-calculated-totals--rationale)
12. [Data Retention & Privacy](#12-data-retention--privacy)
13. [Migration File Plan](#13-migration-file-plan)
14. [Ready-to-Apply Migration SQL](#14-ready-to-apply-migration-sql)
15. [Go Model Structs](#15-go-model-structs)
16. [White-Label Design Notes](#16-white-label-design-notes)
17. [v1 No-Login Design Notes](#17-v1-no-login-design-notes)
18. [Open Questions](#18-open-questions)
19. [Follow-Up Implementation Ticket](#19-follow-up-implementation-ticket)

---

## 1. Decision: Relational vs JSONB

### Options considered

| Approach | Pros | Cons |
|---|---|---|
| **Fully relational** (4 tables) | Queryable line items; consistent with existing backend; admin filtering per field | More joins; slightly more migration surface |
| **JSONB for child rows** | Simpler API, fewer joins; fast initial prototype | Not queryable per-field without index gymnastics; harder to add admin review per line item later |
| **Hybrid** (flat application + JSONB snapshot) | Best of both for PDF stability | Duplication risk |

### Decision

**Fully relational** — consistent with the existing backend conventions (`change_orders`, `jobs`, etc.) and necessary for future admin review, filtering by status, and AP workflows. A JSONB `snapshot` field is added to `payment_applications` as a redundant audit record at submission time (see Section 11).

---

## 2. Tables Overview

| Table | Purpose |
|---|---|
| `pa_tenants` | White-label tenant registry (JBS in v1, other GCs later) |
| `payment_applications` | One row per submitted application; includes contact, project, contract, payment, PDF, email, and review metadata |
| `payment_application_change_orders` | Individual change order rows linked to a submission |
| `payment_application_line_items` | Continuation sheet / Schedule of Values rows linked to a submission |

---

## 3. Table: `pa_tenants`

One row per white-label tenant. JBS is the only tenant in v1.

### Schema

```sql
CREATE TABLE IF NOT EXISTS pa_tenants (
    id                  SERIAL PRIMARY KEY,
    slug                VARCHAR(100) UNIQUE NOT NULL,     -- URL/API identifier, e.g. 'jbs'
    name                VARCHAR(255) NOT NULL,            -- Display name, e.g. 'JBS Construction'
    ap_email            VARCHAR(255),                     -- AP copy delivery address
    brand_config        JSONB DEFAULT '{}',               -- Logo URL, colors, PDF header (white-label)
    active              BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Seed data (JBS v1)

```sql
INSERT INTO pa_tenants (slug, name, ap_email, active)
VALUES ('jbs', 'JBS Construction', 'info@jbsconstructiongroup.com', true)
ON CONFLICT (slug) DO NOTHING;
```

---

## 4. Table: `payment_applications`

The core submission record. One row per completed-and-submitted application.

### Schema

```sql
CREATE TABLE IF NOT EXISTS payment_applications (
    -- Identity
    id                          SERIAL PRIMARY KEY,
    tenant_id                   INTEGER NOT NULL REFERENCES pa_tenants(id),
    submission_token            VARCHAR(64) UNIQUE NOT NULL,  -- public no-auth lookup token (secure random)

    -- Subcontractor contact (Step 1)
    company_name                VARCHAR(255) NOT NULL,
    contact_name                VARCHAR(255) NOT NULL,
    email                       VARCHAR(255) NOT NULL,
    phone                       VARCHAR(30),
    address_line1               VARCHAR(255),
    address_line2               VARCHAR(255),
    city                        VARCHAR(100),
    state                       VARCHAR(2),
    zip                         VARCHAR(10),

    -- Project info (Step 2)
    project_name                VARCHAR(255) NOT NULL,
    project_number              VARCHAR(100),
    owner                       VARCHAR(255),
    contractor                  VARCHAR(255),
    contract_date               DATE,
    application_number          INTEGER NOT NULL DEFAULT 1,
    period_to                   DATE,

    -- Contract summary inputs (Step 3)
    original_contract_sum       DECIMAL(14,2) NOT NULL DEFAULT 0,
    retainage_percent           DECIMAL(5,2)  NOT NULL DEFAULT 10,
    previous_certificates       DECIMAL(14,2) NOT NULL DEFAULT 0,
    additional_notes            TEXT,

    -- Calculated totals (stored at submission time — see Section 11)
    calc_net_change_orders      DECIMAL(14,2) NOT NULL DEFAULT 0,   -- sum of change_orders.amount
    calc_contract_sum_to_date   DECIMAL(14,2) NOT NULL DEFAULT 0,   -- original + net COs
    calc_total_completed_stored DECIMAL(14,2) NOT NULL DEFAULT 0,   -- sum of line items
    calc_retainage_amount       DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_earned_less_retainage  DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_current_payment_due    DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_balance_to_finish      DECIMAL(14,2) NOT NULL DEFAULT 0,

    -- Full submission snapshot (audit/PDF stability)
    submission_snapshot         JSONB,                              -- complete form payload at submit time

    -- Stripe payment (Step 7 — not active in v1)
    payment_status              VARCHAR(30) NOT NULL DEFAULT 'pending',
    stripe_checkout_session_id  VARCHAR(255),
    stripe_payment_intent_id    VARCHAR(255),
    payment_amount_cents        INTEGER NOT NULL DEFAULT 999,       -- $9.99
    paid_at                     TIMESTAMP,

    -- PDF generation (after payment — not active in v1)
    pdf_status                  VARCHAR(30) NOT NULL DEFAULT 'not_generated',
    pdf_storage_key             VARCHAR(500),                       -- Cloudflare R2 / S3 object key
    pdf_generated_at            TIMESTAMP,
    pdf_download_token          VARCHAR(64),                        -- secure one-time or expiring token
    pdf_download_expires_at     TIMESTAMP,

    -- Email delivery (after PDF — not active in v1)
    email_status                VARCHAR(30) NOT NULL DEFAULT 'not_sent',
    email_sent_at               TIMESTAMP,
    email_resend_message_id     VARCHAR(255),
    ap_email_status             VARCHAR(30) NOT NULL DEFAULT 'not_sent',
    ap_email_sent_at            TIMESTAMP,
    ap_email_resend_message_id  VARCHAR(255),

    -- Admin review (not active in v1)
    review_status               VARCHAR(30) NOT NULL DEFAULT 'unreviewed',
    reviewed_by                 INTEGER REFERENCES users(id),       -- nullable; requires auth in future
    reviewed_at                 TIMESTAMP,
    review_notes                TEXT,

    -- Audit / error tracking
    error_log                   JSONB DEFAULT '[]',                 -- array of {timestamp, step, message}
    ip_address                  VARCHAR(45),                        -- IPv4 or IPv6
    user_agent                  TEXT,

    -- Timestamps
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Table: `payment_application_change_orders`

Individual change order records from Step 4 of the form.

### Schema

```sql
CREATE TABLE IF NOT EXISTS payment_application_change_orders (
    id                          SERIAL PRIMARY KEY,
    payment_application_id      INTEGER NOT NULL REFERENCES payment_applications(id) ON DELETE CASCADE,
    co_number                   VARCHAR(50),
    description                 TEXT,
    amount                      DECIMAL(14,2) NOT NULL DEFAULT 0,
    date_approved               DATE,
    sort_order                  INTEGER NOT NULL DEFAULT 0,         -- preserves display order
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Table: `payment_application_line_items`

Continuation sheet / Schedule of Values rows from Step 5 of the form.

### Schema

```sql
CREATE TABLE IF NOT EXISTS payment_application_line_items (
    id                          SERIAL PRIMARY KEY,
    payment_application_id      INTEGER NOT NULL REFERENCES payment_applications(id) ON DELETE CASCADE,
    item_no                     VARCHAR(50),
    description                 TEXT,
    scheduled_value             DECIMAL(14,2) NOT NULL DEFAULT 0,
    prev_completed              DECIMAL(14,2) NOT NULL DEFAULT 0,
    this_period                 DECIMAL(14,2) NOT NULL DEFAULT 0,
    materials_stored            DECIMAL(14,2) NOT NULL DEFAULT 0,

    -- Calculated at submission time (stored for PDF)
    calc_total_completed        DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_percent_complete       DECIMAL(6,2)  NOT NULL DEFAULT 0,
    calc_balance_to_finish      DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_retainage              DECIMAL(14,2) NOT NULL DEFAULT 0,

    sort_order                  INTEGER NOT NULL DEFAULT 0,
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Status Enums

These are enforced via `CHECK` constraints in PostgreSQL rather than a separate `enums` type, to match the existing backend convention (see `005_create_change_orders_table.sql`).

### `payment_status`

| Value | Meaning |
|---|---|
| `pending` | Application submitted; awaiting payment |
| `paid` | Stripe payment confirmed via webhook |
| `failed` | Stripe payment failed or declined |
| `refunded` | Payment reversed after the fact |

### `pdf_status`

| Value | Meaning |
|---|---|
| `not_generated` | Payment not yet confirmed |
| `generating` | PDF generation job in progress |
| `generated` | PDF stored in R2/S3; download token issued |
| `failed` | PDF generation error; see `error_log` |

### `email_status` / `ap_email_status`

| Value | Meaning |
|---|---|
| `not_sent` | Not yet attempted |
| `sent` | Accepted by Resend |
| `failed` | Delivery error; see `error_log` |
| `bounced` | Hard bounce reported by Resend webhook |

### `review_status`

| Value | Meaning |
|---|---|
| `unreviewed` | Default; AP has not yet reviewed |
| `reviewed` | Marked reviewed by AP/admin |
| `flagged` | Flagged for follow-up |
| `archived` | Soft-archived; not shown in default admin list |

---

## 8. Relationships Diagram

```
pa_tenants (1)
    └── payment_applications (N)    [tenant_id → pa_tenants.id]
            ├── payment_application_change_orders (N)   [payment_application_id → payment_applications.id]
            └── payment_application_line_items (N)      [payment_application_id → payment_applications.id]

users (1) ─── payment_applications.reviewed_by (nullable FK, future use)
```

---

## 9. Indexes

```sql
-- pa_tenants
CREATE INDEX idx_pa_tenants_slug        ON pa_tenants(slug);
CREATE INDEX idx_pa_tenants_active      ON pa_tenants(active);

-- payment_applications
CREATE INDEX idx_pa_tenant_id           ON payment_applications(tenant_id);
CREATE INDEX idx_pa_submission_token    ON payment_applications(submission_token);
CREATE INDEX idx_pa_email               ON payment_applications(email);
CREATE INDEX idx_pa_payment_status      ON payment_applications(payment_status);
CREATE INDEX idx_pa_review_status       ON payment_applications(review_status);
CREATE INDEX idx_pa_stripe_session      ON payment_applications(stripe_checkout_session_id);
CREATE INDEX idx_pa_created_at          ON payment_applications(created_at DESC);

-- change orders
CREATE INDEX idx_pa_co_application_id   ON payment_application_change_orders(payment_application_id);

-- line items
CREATE INDEX idx_pa_li_application_id   ON payment_application_line_items(payment_application_id);
```

---

## 10. Validation Rules

These are enforced at the API handler layer in Go (before insert), not via database constraints, consistent with the existing backend pattern.

| Field | Rule |
|---|---|
| `email` | Valid RFC 5322 email format |
| `state` | 2-character US state code from allowlist |
| `original_contract_sum` | Must be ≥ 0; required |
| `retainage_percent` | 0.00 – 50.00 |
| `application_number` | Must be ≥ 1 |
| `phone` | Optional; max 30 chars |
| `zip` | Optional; max 10 chars |
| `submission_token` | Must be 32+ bytes of cryptographic random; generated server-side |
| All `DECIMAL(14,2)` fields | Max representable: $999,999,999,999.99 |
| `payment_amount_cents` | Fixed at 999 for v1; validated server-side |
| `ip_address` | Max 45 chars; supports IPv4 and IPv6 |

---

## 11. Stored Calculated Totals — Rationale

The schema stores calculated totals in both `payment_applications` (aggregate) and `payment_application_line_items` (per-row). This is intentional for three reasons:

1. **PDF generation stability** — The PDF must reflect the numbers the user saw at submission time. If the calculation logic changes, historical PDFs must not change. Storing the calculated values ensures this.

2. **Admin query performance** — AP staff need to filter or sort by `current_payment_due` without re-running calculations against line items.

3. **Audit integrity** — The `submission_snapshot` JSONB field stores the complete raw form payload as submitted, providing a full audit trail independent of the relational rows.

**Tradeoff:** Calculated fields may become stale if a record is edited post-submission. However, v1 does not support editing after submission, so this is not a concern. If edit-after-submission is added in a future version, a recalculation job should be triggered on update.

---

## 12. Data Retention & Privacy

### PII collected

The following fields constitute personally identifiable information (PII):

- `company_name`, `contact_name`, `email`, `phone`
- `address_line1`, `address_line2`, `city`, `state`, `zip`
- `ip_address`, `user_agent`
- `submission_snapshot` (contains all of the above)

### Recommendations

| Topic | Recommendation |
|---|---|
| **Retention period** | Financial payment records should be retained for 7 years per standard accounting practice. Define a retention policy before going live. |
| **Deletion** | Use a soft-delete flag (`archived` review_status) rather than hard DELETE to avoid accidental data loss. |
| **IP/user-agent** | Consider whether collection requires a cookie/privacy notice update. In most jurisdictions, collecting IP in the context of a financial transaction does not require separate consent, but confirm with counsel. |
| **Email at rest** | If GDPR or CCPA applies, provide a documented subject data deletion process. |
| **JSONB snapshot** | The snapshot should be treated as PII data. Ensure it is excluded from any logs or debugging output. |
| **Database access** | The Railway PostgreSQL instance should restrict access to the backend service only. No direct external access to the DB. |

---

## 13. Migration File Plan

These files should be created in `jbs-internal-portal/backend/internal/database/migrations/` as part of TICKET-006 (API endpoints). The next available migration number is `020`.

| Migration file | Contents |
|---|---|
| `020_create_pa_tenants.sql` | `pa_tenants` table + indexes + JBS seed row |
| `021_create_payment_applications.sql` | `payment_applications` table + CHECK constraints + indexes + `updated_at` trigger |
| `022_create_payment_application_change_orders.sql` | `payment_application_change_orders` table + indexes |
| `023_create_payment_application_line_items.sql` | `payment_application_line_items` table + indexes |

> **Do not apply these migrations until TICKET-006 is approved and the backend API work begins.**

---

## 14. Ready-to-Apply Migration SQL

The following SQL is production-ready for the JBS backend migration runner. Copy each block into the corresponding numbered `.sql` file when implementing TICKET-006.

### 020_create_pa_tenants.sql

```sql
-- Migration: Create pa_tenants table (payment application white-label tenants)
-- Created: 2026-05

CREATE TABLE IF NOT EXISTS pa_tenants (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    ap_email        VARCHAR(255),
    brand_config    JSONB NOT NULL DEFAULT '{}',
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pa_tenants_slug   ON pa_tenants(slug);
CREATE INDEX idx_pa_tenants_active ON pa_tenants(active);

CREATE TRIGGER update_pa_tenants_updated_at
    BEFORE UPDATE ON pa_tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed JBS tenant
-- AP email confirmed by client (May 2026)
INSERT INTO pa_tenants (slug, name, ap_email, active)
VALUES ('jbs', 'JBS Construction', 'info@jbsconstructiongroup.com', true)
ON CONFLICT (slug) DO NOTHING;
```

### 021_create_payment_applications.sql

```sql
-- Migration: Create payment_applications table
-- Created: 2026-05

CREATE TABLE IF NOT EXISTS payment_applications (
    id                          SERIAL PRIMARY KEY,
    tenant_id                   INTEGER NOT NULL REFERENCES pa_tenants(id),
    submission_token            VARCHAR(64) UNIQUE NOT NULL,

    -- Subcontractor contact
    company_name                VARCHAR(255) NOT NULL,
    contact_name                VARCHAR(255) NOT NULL,
    email                       VARCHAR(255) NOT NULL,
    phone                       VARCHAR(30),
    address_line1               VARCHAR(255),
    address_line2               VARCHAR(255),
    city                        VARCHAR(100),
    state                       VARCHAR(2),
    zip                         VARCHAR(10),

    -- Project
    project_name                VARCHAR(255) NOT NULL,
    project_number              VARCHAR(100),
    owner                       VARCHAR(255),
    contractor                  VARCHAR(255),
    contract_date               DATE,
    application_number          INTEGER NOT NULL DEFAULT 1,
    period_to                   DATE,

    -- Contract summary inputs
    original_contract_sum       DECIMAL(14,2) NOT NULL DEFAULT 0,
    retainage_percent           DECIMAL(5,2)  NOT NULL DEFAULT 10,
    previous_certificates       DECIMAL(14,2) NOT NULL DEFAULT 0,
    additional_notes            TEXT,

    -- Stored calculated totals
    calc_net_change_orders      DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_contract_sum_to_date   DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_total_completed_stored DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_retainage_amount       DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_earned_less_retainage  DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_current_payment_due    DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_balance_to_finish      DECIMAL(14,2) NOT NULL DEFAULT 0,
    submission_snapshot         JSONB,

    -- Stripe payment
    payment_status              VARCHAR(30) NOT NULL DEFAULT 'pending',
    stripe_checkout_session_id  VARCHAR(255),
    stripe_payment_intent_id    VARCHAR(255),
    payment_amount_cents        INTEGER NOT NULL DEFAULT 999,
    paid_at                     TIMESTAMP,

    -- PDF generation
    pdf_status                  VARCHAR(30) NOT NULL DEFAULT 'not_generated',
    pdf_storage_key             VARCHAR(500),
    pdf_generated_at            TIMESTAMP,
    pdf_download_token          VARCHAR(64),
    pdf_download_expires_at     TIMESTAMP,

    -- Email delivery
    email_status                VARCHAR(30) NOT NULL DEFAULT 'not_sent',
    email_sent_at               TIMESTAMP,
    email_resend_message_id     VARCHAR(255),
    ap_email_status             VARCHAR(30) NOT NULL DEFAULT 'not_sent',
    ap_email_sent_at            TIMESTAMP,
    ap_email_resend_message_id  VARCHAR(255),

    -- Admin review
    review_status               VARCHAR(30) NOT NULL DEFAULT 'unreviewed',
    reviewed_by                 INTEGER REFERENCES users(id),
    reviewed_at                 TIMESTAMP,
    review_notes                TEXT,

    -- Audit
    error_log                   JSONB NOT NULL DEFAULT '[]',
    ip_address                  VARCHAR(45),
    user_agent                  TEXT,

    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE payment_applications
    ADD CONSTRAINT check_payment_status
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    ADD CONSTRAINT check_pdf_status
        CHECK (pdf_status IN ('not_generated', 'generating', 'generated', 'failed')),
    ADD CONSTRAINT check_email_status
        CHECK (email_status IN ('not_sent', 'sent', 'failed', 'bounced')),
    ADD CONSTRAINT check_ap_email_status
        CHECK (ap_email_status IN ('not_sent', 'sent', 'failed', 'bounced')),
    ADD CONSTRAINT check_review_status
        CHECK (review_status IN ('unreviewed', 'reviewed', 'flagged', 'archived')),
    ADD CONSTRAINT check_retainage_percent
        CHECK (retainage_percent >= 0 AND retainage_percent <= 50),
    ADD CONSTRAINT check_application_number
        CHECK (application_number >= 1),
    ADD CONSTRAINT check_payment_amount
        CHECK (payment_amount_cents > 0);

CREATE INDEX idx_pa_tenant_id        ON payment_applications(tenant_id);
CREATE INDEX idx_pa_submission_token ON payment_applications(submission_token);
CREATE INDEX idx_pa_email            ON payment_applications(email);
CREATE INDEX idx_pa_payment_status   ON payment_applications(payment_status);
CREATE INDEX idx_pa_review_status    ON payment_applications(review_status);
CREATE INDEX idx_pa_stripe_session   ON payment_applications(stripe_checkout_session_id);
CREATE INDEX idx_pa_created_at       ON payment_applications(created_at DESC);

CREATE TRIGGER update_payment_applications_updated_at
    BEFORE UPDATE ON payment_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 022_create_payment_application_change_orders.sql

```sql
-- Migration: Create payment_application_change_orders table
-- Created: 2026-05

CREATE TABLE IF NOT EXISTS payment_application_change_orders (
    id                      SERIAL PRIMARY KEY,
    payment_application_id  INTEGER NOT NULL REFERENCES payment_applications(id) ON DELETE CASCADE,
    co_number               VARCHAR(50),
    description             TEXT,
    amount                  DECIMAL(14,2) NOT NULL DEFAULT 0,
    date_approved           DATE,
    sort_order              INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pa_co_application_id ON payment_application_change_orders(payment_application_id);
```

### 023_create_payment_application_line_items.sql

```sql
-- Migration: Create payment_application_line_items table (continuation sheet)
-- Created: 2026-05

CREATE TABLE IF NOT EXISTS payment_application_line_items (
    id                      SERIAL PRIMARY KEY,
    payment_application_id  INTEGER NOT NULL REFERENCES payment_applications(id) ON DELETE CASCADE,
    item_no                 VARCHAR(50),
    description             TEXT,
    scheduled_value         DECIMAL(14,2) NOT NULL DEFAULT 0,
    prev_completed          DECIMAL(14,2) NOT NULL DEFAULT 0,
    this_period             DECIMAL(14,2) NOT NULL DEFAULT 0,
    materials_stored        DECIMAL(14,2) NOT NULL DEFAULT 0,

    -- Stored calculated values (computed at submission time)
    calc_total_completed    DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_percent_complete   DECIMAL(6,2)  NOT NULL DEFAULT 0,
    calc_balance_to_finish  DECIMAL(14,2) NOT NULL DEFAULT 0,
    calc_retainage          DECIMAL(14,2) NOT NULL DEFAULT 0,

    sort_order              INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pa_li_application_id ON payment_application_line_items(payment_application_id);
```

---

## 15. Go Model Structs

The following Go types should be added to `jbs-internal-portal/backend/internal/models/` as part of TICKET-006. They follow the existing conventions in `job.go`, `user.go`, etc.

### `payment_application.go`

```go
package models

import (
    "encoding/json"
    "time"
)

// PATenant is a white-label tenant for the payment application tool.
type PATenant struct {
    ID          int             `json:"id"`
    Slug        string          `json:"slug"`
    Name        string          `json:"name"`
    APEmail     string          `json:"ap_email"`
    BrandConfig json.RawMessage `json:"brand_config"`
    Active      bool            `json:"active"`
    CreatedAt   time.Time       `json:"created_at"`
    UpdatedAt   time.Time       `json:"updated_at"`
}

// PaymentApplication is the core submission record.
type PaymentApplication struct {
    ID              int    `json:"id"`
    TenantID        int    `json:"tenant_id"`
    SubmissionToken string `json:"submission_token"`

    // Step 1 — Contact
    CompanyName  string `json:"company_name"`
    ContactName  string `json:"contact_name"`
    Email        string `json:"email"`
    Phone        string `json:"phone"`
    AddressLine1 string `json:"address_line1"`
    AddressLine2 string `json:"address_line2"`
    City         string `json:"city"`
    State        string `json:"state"`
    Zip          string `json:"zip"`

    // Step 2 — Project
    ProjectName       string     `json:"project_name"`
    ProjectNumber     string     `json:"project_number"`
    Owner             string     `json:"owner"`
    Contractor        string     `json:"contractor"`
    ContractDate      *time.Time `json:"contract_date"`
    ApplicationNumber int        `json:"application_number"`
    PeriodTo          *time.Time `json:"period_to"`

    // Step 3 — Contract summary inputs
    OriginalContractSum   float64 `json:"original_contract_sum"`
    RetainagePercent      float64 `json:"retainage_percent"`
    PreviousCertificates  float64 `json:"previous_certificates"`
    AdditionalNotes       string  `json:"additional_notes"`

    // Stored calculated totals
    CalcNetChangeOrders      float64 `json:"calc_net_change_orders"`
    CalcContractSumToDate    float64 `json:"calc_contract_sum_to_date"`
    CalcTotalCompletedStored float64 `json:"calc_total_completed_stored"`
    CalcRetainageAmount      float64 `json:"calc_retainage_amount"`
    CalcEarnedLessRetainage  float64 `json:"calc_earned_less_retainage"`
    CalcCurrentPaymentDue    float64 `json:"calc_current_payment_due"`
    CalcBalanceToFinish      float64 `json:"calc_balance_to_finish"`

    SubmissionSnapshot json.RawMessage `json:"submission_snapshot,omitempty"`

    // Payment
    PaymentStatus            string     `json:"payment_status"`
    StripeCheckoutSessionID  string     `json:"stripe_checkout_session_id,omitempty"`
    StripePaymentIntentID    string     `json:"stripe_payment_intent_id,omitempty"`
    PaymentAmountCents       int        `json:"payment_amount_cents"`
    PaidAt                   *time.Time `json:"paid_at,omitempty"`

    // PDF
    PDFStatus          string     `json:"pdf_status"`
    PDFStorageKey      string     `json:"pdf_storage_key,omitempty"`
    PDFGeneratedAt     *time.Time `json:"pdf_generated_at,omitempty"`
    PDFDownloadToken   string     `json:"pdf_download_token,omitempty"`
    PDFDownloadExpires *time.Time `json:"pdf_download_expires_at,omitempty"`

    // Email
    EmailStatus             string     `json:"email_status"`
    EmailSentAt             *time.Time `json:"email_sent_at,omitempty"`
    EmailResendMessageID    string     `json:"email_resend_message_id,omitempty"`
    APEmailStatus           string     `json:"ap_email_status"`
    APEmailSentAt           *time.Time `json:"ap_email_sent_at,omitempty"`
    APEmailResendMessageID  string     `json:"ap_email_resend_message_id,omitempty"`

    // Review
    ReviewStatus string     `json:"review_status"`
    ReviewedBy   *int       `json:"reviewed_by,omitempty"`
    ReviewedAt   *time.Time `json:"reviewed_at,omitempty"`
    ReviewNotes  string     `json:"review_notes,omitempty"`

    // Audit
    ErrorLog  json.RawMessage `json:"error_log,omitempty"`
    IPAddress string          `json:"-"` // excluded from API responses
    UserAgent string          `json:"-"` // excluded from API responses

    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`

    // Relationships (populated via joins)
    ChangeOrders []PAChangeOrder `json:"change_orders,omitempty"`
    LineItems    []PALineItem    `json:"line_items,omitempty"`
}

// PAChangeOrder is one change order row from Step 4.
type PAChangeOrder struct {
    ID                   int       `json:"id"`
    PaymentApplicationID int       `json:"payment_application_id"`
    CONumber             string    `json:"co_number"`
    Description          string    `json:"description"`
    Amount               float64   `json:"amount"`
    DateApproved         *time.Time `json:"date_approved,omitempty"`
    SortOrder            int       `json:"sort_order"`
    CreatedAt            time.Time `json:"created_at"`
}

// PALineItem is one Schedule of Values row from Step 5.
type PALineItem struct {
    ID                   int     `json:"id"`
    PaymentApplicationID int     `json:"payment_application_id"`
    ItemNo               string  `json:"item_no"`
    Description          string  `json:"description"`
    ScheduledValue       float64 `json:"scheduled_value"`
    PrevCompleted        float64 `json:"prev_completed"`
    ThisPeriod           float64 `json:"this_period"`
    MaterialsStored      float64 `json:"materials_stored"`

    // Stored calculated values
    CalcTotalCompleted  float64 `json:"calc_total_completed"`
    CalcPercentComplete float64 `json:"calc_percent_complete"`
    CalcBalanceToFinish float64 `json:"calc_balance_to_finish"`
    CalcRetainage       float64 `json:"calc_retainage"`

    SortOrder int       `json:"sort_order"`
    CreatedAt time.Time `json:"created_at"`
}

// PaymentApplicationListItem is a lightweight version for admin list views.
type PaymentApplicationListItem struct {
    ID                    int        `json:"id"`
    SubmissionToken       string     `json:"submission_token"`
    CompanyName           string     `json:"company_name"`
    ProjectName           string     `json:"project_name"`
    ApplicationNumber     int        `json:"application_number"`
    PeriodTo              *time.Time `json:"period_to"`
    CalcCurrentPaymentDue float64    `json:"calc_current_payment_due"`
    PaymentStatus         string     `json:"payment_status"`
    ReviewStatus          string     `json:"review_status"`
    CreatedAt             time.Time  `json:"created_at"`
}
```

---

## 16. White-Label Design Notes

- **`tenant_id`** is on `payment_applications` (not on change orders or line items). Child records cascade from the application, so tenant isolation is enforced at the parent level.
- **`pa_tenants.slug`** is used for API routing (e.g., `POST /api/v1/tenants/jbs/payment-applications`). A middleware can resolve the tenant from the URL slug and inject it into the request context.
- **`pa_tenants.brand_config`** (JSONB) is reserved for per-tenant PDF branding: logo URL, primary colour, footer text. In v1 it defaults to `{}` and the PDF generator falls back to JBS defaults.
- **`pa_tenants.ap_email`** allows each tenant to route AP copy delivery to their own accounts payable address without code changes.
- Adding a new tenant is a single `INSERT` into `pa_tenants` — no schema changes required.

---

## 17. v1 No-Login Design Notes

- **`submission_token`** is a cryptographically random 32-byte hex string generated server-side at submission time. It is included in the confirmation email as a query parameter so the subcontractor can retrieve their submission status and PDF link without authentication.
- **`pdf_download_token`** is a separate short-lived token (e.g., 72-hour expiry via `pdf_download_expires_at`) for the actual PDF download endpoint. This prevents the long-lived submission token from also being a permanent download link.
- **`reviewed_by`** is a nullable FK to `users(id)`. In v1 it will always be `NULL`. When auth is added, the AP staff user ID is stored here.
- No session or JWT infrastructure is needed for v1 submission flow. The `submission_token` IS the identity.

---

## 18. Open Questions

| # | Question | Impact |
|---|---|---|
| 1 | ~~What is the confirmed AP email address for the JBS tenant seed row?~~ **Answered:** `info@jbsconstructiongroup.com` (confirmed May 2026) | ~~Blocks `020` seed data~~ Resolved |
| 2 | Should `submission_token` be a UUID (36 chars) or a hex string (64 chars)? The hex string is slightly more opaque and avoids UUID format recognition. | Migration format only |
| 3 | Should the `reviewed_by` FK be dropped from v1 schema and added in a later migration when auth is ready? | Keeps v1 schema cleaner; FK already has `REFERENCES users(id)` which is valid even if always NULL |
| 4 | What is the confirmed data retention period for financial submissions? | Privacy policy and future cleanup job |
| 5 | Should `ip_address` and `user_agent` collection be disclosed in the site privacy policy before launch? | Legal/compliance |
| 6 | Confirm Cloudflare R2 vs S3 for PDF storage — this affects the `pdf_storage_key` format (R2 uses `r2://bucket/key`, S3 uses `s3://bucket/key`). | PDF storage key convention only |
| 7 | Should `payment_amount_cents` be configurable per-tenant (in `pa_tenants`) rather than hardcoded to 999? | Allows different fees per tenant in white-label scenario |

---

## 19. Follow-Up Implementation Ticket

**Recommended next ticket: TICKET-006 — Backend API Endpoints for Payment Application Submission**

Scope:
1. Create migration files `020`–`023` using the SQL in Section 14.
2. Create `internal/models/payment_application.go` using the structs in Section 15.
3. Implement `POST /api/v1/payment-applications` — validates input, calculates totals server-side, inserts all four tables, returns `submission_token`.
4. Implement `GET /api/v1/payment-applications/:token` — returns full submission by `submission_token` (no auth required in v1).
5. Implement `GET /api/v1/admin/payment-applications` — paginated list for future admin UI (auth-gated from day one).
6. Add input validation middleware for the submission payload.
7. Add `tenant_id` resolution middleware (resolve `jbs` slug → tenant row).
8. Run migrations against Railway PostgreSQL.
9. Add integration tests.

This ticket does **not** include Stripe, PDF generation, or email delivery.
