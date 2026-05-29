import { useState, type ChangeEvent } from 'react';

/* ─── Types ─────────────────────────────────────────────────────────────── */

type LineItem = {
  id: string;
  itemNo: string;
  description: string;
  scheduledValue: string;
  prevCompleted: string;
  thisPeriod: string;
  materialsStored: string;
};

type ChangeOrder = {
  id: string;
  coNumber: string;
  description: string;
  amount: string;
  dateApproved: string;
};

// API response from POST /api/v1/payment-applications
type SubmitResult = {
  id: number;
  submission_token: string;
  message: string;
  totals: {
    net_change_orders: number;
    contract_sum_to_date: number;
    total_completed_stored: number;
    retainage_amount: number;
    earned_less_retainage: number;
    current_payment_due: number;
    balance_to_finish: number;
  };
};

type FormState = {
  // Step 1 — Company & Contact
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  // Step 2 — Project
  projectName: string;
  projectNumber: string;
  owner: string;
  contractor: string;
  contractDate: string;
  applicationNumber: string;
  periodTo: string;
  // Step 3 — Contract Summary
  originalContractSum: string;
  // netChangeOrders is auto-calculated from Step 4 change orders (coTotal)
  retainagePercent: string;
  previousCertificates: string;
  // Misc
  additionalNotes: string;
};

// API base URL from environment variable. Empty string means prototype / demo mode.
const API_URL = (import.meta.env.PUBLIC_API_URL ?? '').replace(/\/$/, '');

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const parseDollar = (v: string): number =>
  parseFloat((v ?? '').replace(/[^0-9.-]/g, '')) || 0;

const fmtUSD = (n: number): string =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const fmtPct = (n: number): string => `${n.toFixed(1)}%`;

let _seq = 0;
const uid = () => `id-${++_seq}-${Math.random().toString(36).slice(2, 6)}`;

const newLI = (idx: number): LineItem => ({
  id: uid(),
  itemNo: String(idx + 1).padStart(2, '0'),
  description: '',
  scheduledValue: '',
  prevCompleted: '',
  thisPeriod: '',
  materialsStored: '',
});

const newCO = (idx: number): ChangeOrder => ({
  id: uid(),
  coNumber: String(idx + 1),
  description: '',
  amount: '',
  dateApproved: '',
});

/* ─── Constants ──────────────────────────────────────────────────────────── */

const STEPS = [
  { n: 1, label: 'Company'  },
  { n: 2, label: 'Project'  },
  { n: 3, label: 'Contract' },
  { n: 4, label: 'Changes'  },
  { n: 5, label: 'Schedule' },
  { n: 6, label: 'Review'   },
  { n: 7, label: 'Payment'  },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

/* ─── Shared Classes ─────────────────────────────────────────────────────── */

const inputCls =
  'w-full px-4 py-3 border border-jbs-dark/15 bg-white text-jbs-dark placeholder-jbs-gray/50 focus:outline-none focus:border-jbs-blue transition-colors text-sm';

const selectCls =
  'w-full px-4 py-3 border border-jbs-dark/15 bg-white text-jbs-dark focus:outline-none focus:border-jbs-blue transition-colors text-sm appearance-none cursor-pointer';

const labelCls =
  'block font-heading text-xs uppercase tracking-wider text-jbs-charcoal mb-2';

const calcCls =
  'w-full px-4 py-3 bg-jbs-blue/5 border border-jbs-blue/20 text-jbs-charcoal text-sm font-semibold cursor-default select-none';

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StepProgressBar({ current }: { current: number }) {
  return (
    <div>
      {/* Mobile: progress bar + label */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue">
            Step {current} of {STEPS.length}
          </p>
          <p className="font-heading text-xs uppercase tracking-wider text-jbs-charcoal/60">
            {STEPS[current - 1].label}
          </p>
        </div>
        <div className="h-1 bg-jbs-dark/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-jbs-blue transition-all duration-300 rounded-full"
            style={{ width: `${(current / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: numbered step pills */}
      <div className="hidden sm:flex items-center">
        {STEPS.map((s, i) => {
          const past   = current > s.n;
          const active = current === s.n;
          const last   = i === STEPS.length - 1;
          return (
            <div key={s.n} className={`flex items-center ${last ? '' : 'flex-1'}`}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-heading transition-all',
                    active
                      ? 'bg-jbs-blue text-white shadow-[0_0_0_3px_rgba(0,160,224,0.2)]'
                      : past
                      ? 'bg-jbs-blue/15 text-jbs-blue'
                      : 'bg-jbs-dark/10 text-jbs-gray',
                  ].join(' ')}
                >
                  {past ? '✓' : s.n}
                </div>
                <span
                  className={[
                    'font-heading text-[9px] uppercase tracking-wider mt-1.5 text-center',
                    active ? 'text-jbs-blue' : past ? 'text-jbs-charcoal/50' : 'text-jbs-gray/50',
                  ].join(' ')}
                >
                  {s.label}
                </span>
              </div>
              {!last && (
                <div
                  className={`flex-1 h-px mx-1 mb-4 transition-colors ${
                    past ? 'bg-jbs-blue/25' : 'bg-jbs-dark/10'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <div className="border-b border-jbs-dark/10 pb-3 mb-6">
      <span className="font-heading text-xs uppercase tracking-widest text-jbs-blue">{tag}</span>
      <h3 className="font-heading text-2xl text-jbs-dark uppercase mt-1">{title}</h3>
    </div>
  );
}

function CalcField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block font-heading text-xs uppercase tracking-wider text-jbs-blue/70 mb-2">
        {label}{' '}
        <span className="normal-case font-body text-[9px] text-jbs-blue/40">(calculated)</span>
      </span>
      <div className={calcCls}>{value}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="font-heading text-[10px] uppercase tracking-wider text-jbs-gray/70 w-36 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-jbs-charcoal text-sm">{value || '—'}</span>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  bold = false,
  accent = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm ${bold ? 'bg-jbs-dark/5' : ''}`}>
      <span
        className={`font-heading text-xs uppercase tracking-wider ${
          accent ? 'text-jbs-blue' : 'text-jbs-charcoal/70'
        }`}
      >
        {label}
      </span>
      <span
        className={`${bold ? 'font-bold text-jbs-dark text-base' : 'text-jbs-charcoal'} ${
          accent ? 'text-jbs-blue' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function PaymentApplicationForm() {
  const [step, setStep]           = useState(1);
  const [lineItems, setLineItems] = useState<LineItem[]>([newLI(0)]);
  const [changeOrders, setCOs]    = useState<ChangeOrder[]>([]);
  const [form, setForm] = useState<FormState>({
    companyName: '',   contactName: '',  email: '',       phone: '',
    addressLine1: '',  addressLine2: '', city: '',        state: '',   zip: '',
    projectName: '',   projectNumber: '', owner: '',      contractor: 'JBS Construction',
    contractDate: '',  applicationNumber: '1',            periodTo: '',
    originalContractSum: '',
    retainagePercent: '10',   previousCertificates: '0.00',
    additionalNotes: '',
  });

  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  /* — Generic field setter — */
  type AnyInput = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const set = (f: keyof FormState) =>
    (e: ChangeEvent<AnyInput>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));

  /* — Line item handlers — */
  const addLI    = () => setLineItems(li => [...li, newLI(li.length)]);
  const removeLI = (id: string) =>
    setLineItems(li => (li.length > 1 ? li.filter(x => x.id !== id) : li));
  const setLI = (id: string, field: keyof LineItem) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setLineItems(li => li.map(x => (x.id === id ? { ...x, [field]: e.target.value } : x)));

  /* — Change order handlers — */
  const addCO    = () => setCOs(co => [...co, newCO(co.length)]);
  const removeCO = (id: string) => setCOs(co => co.filter(x => x.id !== id));
  const setCO = (id: string, field: keyof ChangeOrder) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setCOs(co => co.map(x => (x.id === id ? { ...x, [field]: e.target.value } : x)));

  /* — Calculations — */
  const retPct          = parseFloat(form.retainagePercent || '10') / 100;
  const origSum         = parseDollar(form.originalContractSum);
  // coTotal must be computed first — it feeds netCO and contractSum
  const coTotal         = changeOrders.reduce((s, co) => s + parseDollar(co.amount), 0);
  const netCO           = coTotal;                        // auto-wired from Step 4
  const contractSum     = origSum + netCO;
  const totalCompStored = lineItems.reduce(
    (s, li) =>
      s + parseDollar(li.prevCompleted) + parseDollar(li.thisPeriod) + parseDollar(li.materialsStored),
    0,
  );
  const retainageAmt    = totalCompStored * retPct;
  const earnedLessRet   = totalCompStored - retainageAmt;
  const prevCerts       = parseDollar(form.previousCertificates);
  const currentDue      = earnedLessRet - prevCerts;
  const balanceFinish   = contractSum - totalCompStored;

  const liCalc = (li: LineItem) => {
    const prev  = parseDollar(li.prevCompleted);
    const curr  = parseDollar(li.thisPeriod);
    const mat   = parseDollar(li.materialsStored);
    const sv    = parseDollar(li.scheduledValue);
    const total = prev + curr + mat;
    return {
      total,
      pct: sv > 0 ? (total / sv) * 100 : 0,
      bal: sv - total,
      ret: total * retPct,
    };
  };

  /* — Navigation — */
  const goNext = () => setStep(s => Math.min(s + 1, 7));
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  /* — API submission — */
  function buildPayload() {
    return {
      company_name:  form.companyName,
      contact_name:  form.contactName,
      email:         form.email,
      phone:         form.phone,
      address_line1: form.addressLine1,
      address_line2: form.addressLine2,
      city:          form.city,
      state:         form.state,
      zip:           form.zip,
      project_name:       form.projectName,
      project_number:     form.projectNumber,
      owner:              form.owner,
      contractor:         form.contractor,
      contract_date:      form.contractDate || '',
      application_number: parseInt(form.applicationNumber, 10) || 1,
      period_to:          form.periodTo || '',
      original_contract_sum:  parseDollar(form.originalContractSum),
      retainage_percent:      parseFloat(form.retainagePercent) || 0,
      previous_certificates:  parseDollar(form.previousCertificates),
      additional_notes:       form.additionalNotes,
      change_orders: changeOrders.map((co, i) => ({
        co_number:     co.coNumber,
        description:   co.description,
        amount:        parseDollar(co.amount),
        date_approved: co.dateApproved || '',
        sort_order:    i,
      })),
      line_items: lineItems.map((li, i) => ({
        item_no:          li.itemNo,
        description:      li.description,
        scheduled_value:  parseDollar(li.scheduledValue),
        prev_completed:   parseDollar(li.prevCompleted),
        this_period:      parseDollar(li.thisPeriod),
        materials_stored: parseDollar(li.materialsStored),
        sort_order:       i,
      })),
    };
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/payment-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server returned ${res.status}`);
      }
      const data = await res.json() as SubmitResult;
      setSubmitResult(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unexpected error — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Success view (replaces step flow after successful submission) ─────── */
  if (submitResult) {
    return (
      <div className="space-y-8">
        <div className="border-l-4 border-jbs-blue pl-5 py-2">
          <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-1">
            Application Submitted
          </p>
          <p className="text-jbs-charcoal/70 text-sm">{submitResult.message}</p>
        </div>

        <div className="border border-jbs-dark/10 p-5 space-y-2">
          <p className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal/50">
            Confirmation Token
          </p>
          <p className="font-mono text-sm text-jbs-charcoal break-all bg-jbs-dark/5 px-4 py-3">
            {submitResult.submission_token}
          </p>
          <p className="text-jbs-gray/60 text-xs">
            Save this token to reference your submission with JBS Accounts Payable.
          </p>
        </div>

        <div className="border border-jbs-dark/10">
          <div className="px-5 py-3 border-b border-jbs-dark/10 bg-jbs-dark/5">
            <p className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal">
              Server-Verified Totals
            </p>
          </div>
          <div className="divide-y divide-jbs-dark/8">
            <SummaryLine label="Net Change Orders"            value={fmtUSD(submitResult.totals.net_change_orders)} />
            <SummaryLine label="Contract Sum to Date"         value={fmtUSD(submitResult.totals.contract_sum_to_date)} bold />
            <SummaryLine label="Total Completed &amp; Stored" value={fmtUSD(submitResult.totals.total_completed_stored)} />
            <SummaryLine label="Retainage"                    value={fmtUSD(submitResult.totals.retainage_amount)} />
            <SummaryLine label="Total Earned Less Retainage"  value={fmtUSD(submitResult.totals.earned_less_retainage)} />
            <SummaryLine label="Current Payment Due"          value={fmtUSD(submitResult.totals.current_payment_due)} bold accent />
            <SummaryLine label="Balance to Finish"            value={fmtUSD(submitResult.totals.balance_to_finish)} />
          </div>
        </div>

        <div className="border border-dashed border-jbs-blue/30 p-6 space-y-3">
          <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue">
            Next: Payment — Coming Soon
          </p>
          <p className="text-jbs-charcoal/60 text-sm leading-relaxed">
            Stripe Checkout and PDF generation will be connected in a future release.
            Your submission has been saved. JBS Accounts Payable review tools will be connected in a future release.
          </p>
          <ul className="space-y-1.5 text-sm text-jbs-charcoal/50">
            <li className="flex items-start gap-2">
              <span className="text-jbs-blue shrink-0">→</span>
              Secure $9.99 payment via Stripe Checkout (planned)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-jbs-blue shrink-0">→</span>
              JBS-branded Application for Payment PDF (planned)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-jbs-blue shrink-0">→</span>
              Email delivery to <strong>{form.email || 'your email'}</strong> (planned)
            </li>
          </ul>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div>
      <StepProgressBar current={step} />

      <div className="mt-8 space-y-6">

        {/* ══ STEP 1: Company & Contact ═══════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <SectionHeader tag="Step 1 of 7" title="Company & Contact Information" />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>
                  Company Name <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="Acme Electrical LLC"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Contact Name <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={set('contactName')}
                  placeholder="Jane Smith"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Email Address <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="jane@acmeelectrical.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Phone Number <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="(555) 000-0000"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Address Line 1 <span className="text-jbs-blue">*</span>
              </label>
              <input
                type="text"
                value={form.addressLine1}
                onChange={set('addressLine1')}
                placeholder="123 Main St"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Address Line 2</label>
              <input
                type="text"
                value={form.addressLine2}
                onChange={set('addressLine2')}
                placeholder="Suite 200"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className={labelCls}>
                  City <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="Dallas"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  State <span className="text-jbs-blue">*</span>
                </label>
                <div className="relative">
                  <select value={form.state} onChange={set('state')} className={selectCls}>
                    <option value="">—</option>
                    {US_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-jbs-gray text-xs">
                    ▼
                  </span>
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  ZIP <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={set('zip')}
                  placeholder="75001"
                  maxLength={10}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Project Information ═════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            <SectionHeader tag="Step 2 of 7" title="Project Information" />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>
                  Project Name <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={set('projectName')}
                  placeholder="Retail Store #42 Build-Out"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Project Number</label>
                <input
                  type="text"
                  value={form.projectNumber}
                  onChange={set('projectNumber')}
                  placeholder="JBS-2026-042"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Owner / Client <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={set('owner')}
                  placeholder="ABC Retail Group LLC"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Contractor (GC) <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.contractor}
                  onChange={set('contractor')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Contract Date <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="date"
                  value={form.contractDate}
                  onChange={set('contractDate')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Application Number <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.applicationNumber}
                  onChange={set('applicationNumber')}
                  className={inputCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>
                  Period To — Billing Period End Date <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="date"
                  value={form.periodTo}
                  onChange={set('periodTo')}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Contract & Application Summary ══════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <SectionHeader tag="Step 3 of 7" title="Contract & Application Summary" />

            <div className="border-l-4 border-jbs-blue/30 pl-4">
              <p className="text-jbs-charcoal/60 text-sm leading-relaxed">
                Enter your contract values below. Fields shown in blue update automatically.
                Net Change by Change Orders is totalled automatically from Step 4.
                Completed &amp; Stored totals update from your Schedule of Values in Step 5.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>
                  Original Contract Sum ($) <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="text"
                  value={form.originalContractSum}
                  onChange={set('originalContractSum')}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <CalcField
                  label="Net Change by Change Orders ($)"
                  value={fmtUSD(coTotal)}
                />
                <p className="text-jbs-gray/80 text-xs mt-1.5">
                  Add individual change orders in Step 4 — this total updates automatically.
                </p>
              </div>
              <CalcField label="Contract Sum to Date" value={fmtUSD(contractSum)} />
              <CalcField label="Total Completed & Stored to Date" value={fmtUSD(totalCompStored)} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>
                  Retainage % <span className="text-jbs-blue">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={form.retainagePercent}
                  onChange={set('retainagePercent')}
                  className={inputCls}
                />
              </div>
              <CalcField
                label={`Retainage Amount (${form.retainagePercent || 0}%)`}
                value={fmtUSD(retainageAmt)}
              />
              <CalcField label="Total Earned Less Retainage" value={fmtUSD(earnedLessRet)} />
              <div>
                <label className={labelCls}>Less Previous Certificates for Payment ($)</label>
                <input
                  type="text"
                  value={form.previousCertificates}
                  onChange={set('previousCertificates')}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <CalcField label="Current Payment Due" value={fmtUSD(currentDue)} />
              <CalcField label="Balance to Finish Including Retainage" value={fmtUSD(balanceFinish)} />
            </div>

            <p className="text-jbs-gray/60 text-xs">
              * Calculated fields reflect data entered in the Schedule of Values (Step 5). Values
              will update as you complete that step.
            </p>
          </div>
        )}

        {/* ══ STEP 4: Change Order Summary ════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6">
            <SectionHeader tag="Step 4 of 7" title="Change Order Summary" />

            <div className="border-l-4 border-jbs-blue/30 pl-4">
              <p className="text-jbs-charcoal/60 text-sm leading-relaxed">
                Document individual approved change orders. The total here feeds the{' '}
                <strong>Net Change by Change Orders</strong> field in Step 3 automatically.
                If your application has no change orders, skip to Step 5.
              </p>
            </div>

            {changeOrders.length === 0 && (
              <div className="border border-dashed border-jbs-dark/20 p-8 text-center">
                <p className="font-heading text-sm uppercase tracking-widest text-jbs-gray mb-2">
                  No Change Orders
                </p>
                <p className="text-jbs-charcoal/50 text-sm">
                  This application has no change orders. Click below to add one if applicable.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {changeOrders.map((co, i) => (
                <div key={co.id} className="border border-jbs-dark/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs uppercase tracking-widest text-jbs-blue">
                      Change Order {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCO(co.id)}
                      className="font-heading text-[10px] uppercase tracking-wider text-jbs-gray hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>CO Number</label>
                      <input
                        type="text"
                        value={co.coNumber}
                        onChange={setCO(co.id, 'coNumber')}
                        placeholder="CO-001"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Amount ($)</label>
                      <input
                        type="text"
                        value={co.amount}
                        onChange={setCO(co.id, 'amount')}
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <input
                        type="text"
                        value={co.description}
                        onChange={setCO(co.id, 'description')}
                        placeholder="Additional conduit run — east wing"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Date Approved</label>
                      <input
                        type="date"
                        value={co.dateApproved}
                        onChange={setCO(co.id, 'dateApproved')}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCO}
              className="w-full py-3 border border-dashed border-jbs-blue/40 text-jbs-blue font-heading text-xs uppercase tracking-widest hover:bg-jbs-blue/5 transition-colors"
            >
              + Add Change Order
            </button>

            {changeOrders.length > 0 && (
              <div className="bg-jbs-blue/5 border border-jbs-blue/20 px-5 py-3 flex items-center justify-between">
                <span className="font-heading text-xs uppercase tracking-wider text-jbs-charcoal">
                  Change Order Total
                </span>
                <span className="font-heading text-lg text-jbs-blue">{fmtUSD(coTotal)}</span>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 5: Schedule of Values — Continuation Sheet ══════════════════ */}
        {step === 5 && (
          <div className="space-y-6">
            <SectionHeader tag="Step 5 of 7" title="Schedule of Values — Continuation Sheet" />

            <div className="border-l-4 border-jbs-blue/30 pl-4">
              <p className="text-jbs-charcoal/60 text-sm leading-relaxed">
                List each line item from your Schedule of Values. Total Completed, % Complete,
                Balance to Finish, and Retainage are calculated automatically using the retainage
                percentage you entered in Step 3.
              </p>
            </div>

            <div className="space-y-4">
              {lineItems.map((li, i) => {
                const calc = liCalc(li);
                return (
                  <div key={li.id} className="border border-jbs-dark/10 p-5 space-y-4">
                    {/* Row header */}
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-xs uppercase tracking-widest text-jbs-blue">
                        Line Item {i + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLI(li.id)}
                          className="font-heading text-[10px] uppercase tracking-wider text-jbs-gray hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Item No.</label>
                        <input
                          type="text"
                          value={li.itemNo}
                          onChange={setLI(li.id, 'itemNo')}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Description of Work <span className="text-jbs-blue">*</span>
                        </label>
                        <input
                          type="text"
                          value={li.description}
                          onChange={setLI(li.id, 'description')}
                          placeholder="Rough Electrical"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Scheduled Value ($)</label>
                        <input
                          type="text"
                          value={li.scheduledValue}
                          onChange={setLI(li.id, 'scheduledValue')}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Work Completed — Previous Application ($)</label>
                        <input
                          type="text"
                          value={li.prevCompleted}
                          onChange={setLI(li.id, 'prevCompleted')}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Work Completed — This Period ($)</label>
                        <input
                          type="text"
                          value={li.thisPeriod}
                          onChange={setLI(li.id, 'thisPeriod')}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Materials Presently Stored ($)</label>
                        <input
                          type="text"
                          value={li.materialsStored}
                          onChange={setLI(li.id, 'materialsStored')}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Calculated row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      {[
                        { l: 'Total Comp. & Stored', v: fmtUSD(calc.total) },
                        { l: '% Complete',            v: fmtPct(calc.pct)  },
                        { l: 'Balance to Finish',     v: fmtUSD(calc.bal)  },
                        { l: 'Retainage',             v: fmtUSD(calc.ret)  },
                      ].map(({ l, v }) => (
                        <div key={l} className={`${calcCls} text-center py-2`}>
                          <div className="font-heading text-[9px] uppercase tracking-wider text-jbs-blue/60 mb-1">
                            {l}
                          </div>
                          <div className="text-sm">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addLI}
              className="w-full py-3 border border-dashed border-jbs-blue/40 text-jbs-blue font-heading text-xs uppercase tracking-widest hover:bg-jbs-blue/5 transition-colors"
            >
              + Add Line Item
            </button>

            {/* Schedule totals */}
            <div className="border border-jbs-dark/10 p-5 space-y-3">
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal/50">
                Schedule Totals
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <CalcField
                  label="Total Scheduled Value"
                  value={fmtUSD(lineItems.reduce((s, li) => s + parseDollar(li.scheduledValue), 0))}
                />
                <CalcField label="Total Completed & Stored" value={fmtUSD(totalCompStored)} />
              </div>
            </div>

            {/* Additional notes */}
            <div>
              <label className={labelCls}>Additional Notes</label>
              <textarea
                value={form.additionalNotes}
                onChange={set('additionalNotes')}
                rows={3}
                placeholder="Any clarifications or notes for JBS accounting…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        )}

        {/* ══ STEP 6: Review / Summary ══════════════════════════════════════════ */}
        {step === 6 && (
          <div className="space-y-8">
            <SectionHeader tag="Step 6 of 7" title="Review Your Application" />

            <div className="border-l-4 border-jbs-blue/30 pl-4">
              <p className="text-jbs-charcoal/60 text-sm leading-relaxed">
                Review all information below before proceeding to payment. Use the Back button to
                make changes.
              </p>
            </div>

            {/* Company & Contact */}
            <div>
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-4">
                Company & Contact
              </p>
              <div className="grid md:grid-cols-2 gap-x-8">
                <ReviewRow label="Company" value={form.companyName} />
                <ReviewRow label="Contact" value={form.contactName} />
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow
                  label="Address"
                  value={[form.addressLine1, form.addressLine2, form.city, form.state, form.zip]
                    .filter(Boolean)
                    .join(', ')}
                />
              </div>
            </div>

            {/* Project */}
            <div>
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-4">
                Project
              </p>
              <div className="grid md:grid-cols-2 gap-x-8">
                <ReviewRow label="Project Name"    value={form.projectName} />
                <ReviewRow label="Project No."     value={form.projectNumber} />
                <ReviewRow label="Owner"           value={form.owner} />
                <ReviewRow label="Contractor (GC)" value={form.contractor} />
                <ReviewRow label="Contract Date"   value={form.contractDate} />
                <ReviewRow label="Application No." value={form.applicationNumber} />
                <ReviewRow label="Period To"       value={form.periodTo} />
              </div>
            </div>

            {/* Contract Summary */}
            <div>
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-4">
                Contract Summary
              </p>
              <div className="border border-jbs-dark/10 divide-y divide-jbs-dark/8">
                <SummaryLine label="Original Contract Sum"            value={fmtUSD(origSum)} />
                <SummaryLine label="Net Change by Change Orders"      value={fmtUSD(netCO)} />
                <SummaryLine label="Contract Sum to Date"             value={fmtUSD(contractSum)} bold />
                <SummaryLine label="Total Completed & Stored to Date" value={fmtUSD(totalCompStored)} />
                <SummaryLine label={`Retainage (${form.retainagePercent}%)`} value={fmtUSD(retainageAmt)} />
                <SummaryLine label="Total Earned Less Retainage"      value={fmtUSD(earnedLessRet)} />
                <SummaryLine label="Less Previous Certificates"       value={fmtUSD(prevCerts)} />
                <SummaryLine label="Current Payment Due"              value={fmtUSD(currentDue)} bold accent />
                <SummaryLine label="Balance to Finish Incl. Retainage" value={fmtUSD(balanceFinish)} />
              </div>
            </div>

            {/* Schedule of Values */}
            <div>
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-4">
                Schedule of Values — {lineItems.length} Line Item{lineItems.length !== 1 ? 's' : ''}
              </p>
              <div className="border border-jbs-dark/10 divide-y divide-jbs-dark/8">
                {lineItems.map(li => {
                  const calc = liCalc(li);
                  return (
                    <div
                      key={li.id}
                      className="px-4 py-3 flex items-center justify-between text-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-heading text-[10px] uppercase text-jbs-blue mr-2">
                          {li.itemNo}
                        </span>
                        <span className="text-jbs-dark">
                          {li.description || <em className="text-jbs-gray/60 font-normal">No description</em>}
                        </span>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <div className="text-jbs-charcoal font-semibold">{fmtUSD(calc.total)}</div>
                        <div className="text-jbs-gray text-xs">{fmtPct(calc.pct)} complete</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Change orders */}
            {changeOrders.length > 0 && (
              <div>
                <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-4">
                  Change Orders — {changeOrders.length} item{changeOrders.length !== 1 ? 's' : ''}
                </p>
                <div className="border border-jbs-dark/10 divide-y divide-jbs-dark/8">
                  {changeOrders.map(co => (
                    <div
                      key={co.id}
                      className="px-4 py-3 flex items-center justify-between text-sm"
                    >
                      <span className="text-jbs-dark">
                        {co.coNumber}
                        {co.description ? ` — ${co.description}` : ''}
                      </span>
                      <span className="text-jbs-charcoal font-semibold ml-4 shrink-0">
                        {fmtUSD(parseDollar(co.amount))}
                      </span>
                    </div>
                  ))}
                  <div className="px-4 py-3 flex items-center justify-between text-sm bg-jbs-blue/5">
                    <span className="font-heading text-xs uppercase text-jbs-charcoal">CO Total</span>
                    <span className="font-heading text-jbs-blue">{fmtUSD(coTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional notes */}
            {form.additionalNotes && (
              <div>
                <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-2">
                  Additional Notes
                </p>
                <p className="text-jbs-charcoal/70 text-sm leading-relaxed border-l-4 border-jbs-dark/10 pl-4">
                  {form.additionalNotes}
                </p>
              </div>
            )}

            {/* Acknowledgment */}
            <div className="border border-jbs-dark/10 bg-jbs-cream/30 p-5">
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal mb-2">
                Acknowledgment
              </p>
              <p className="text-jbs-charcoal/70 text-sm leading-relaxed">
                By submitting this application, you confirm that the information entered is accurate
                and complete to the best of your knowledge. This document is not an official AIA form.
              </p>
            </div>

            {!API_URL && (
              <div className="border border-amber-400/40 bg-amber-50/50 px-5 py-4">
                <p className="font-heading text-xs uppercase tracking-widest text-amber-700 mb-1">
                  Prototype Mode — Submission Disabled
                </p>
                <p className="text-amber-800/70 text-sm">
                  <code className="font-mono bg-amber-100 px-1 text-xs">PUBLIC_API_URL</code> is not
                  configured. Review is fully functional; submission requires backend API setup.
                </p>
              </div>
            )}

            {submitError && (
              <div className="border border-red-300/60 bg-red-50 px-5 py-4">
                <p className="font-heading text-xs uppercase tracking-widest text-red-700 mb-1">
                  Submission Failed
                </p>
                <p className="text-red-700/80 text-sm">{submitError}</p>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="font-heading text-[10px] uppercase tracking-wider text-red-600 hover:text-red-800 mt-2"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 7: Payment Placeholder ══════════════════════════════════════ */}
        {step === 7 && (
          <div className="space-y-8">
            <SectionHeader tag="Step 7 of 7" title="Payment & Document Generation" />

            {/* Prototype banner */}
            <div className="border-l-4 border-jbs-blue bg-jbs-blue/5 p-6">
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-blue mb-2">
                Stripe Payment Integration — Coming Soon
              </p>
              <p className="text-jbs-charcoal/70 text-sm leading-relaxed">
                This step will connect to Stripe Checkout for a one-time <strong>$9.99</strong>{' '}
                application fee. After payment is confirmed, a JBS-branded Application for Payment
                PDF will be generated and copies delivered. These features are planned for a future
                release.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-jbs-charcoal/60">
                <li className="flex items-start gap-2">
                  <span className="text-jbs-blue mt-0.5 shrink-0">→</span>
                  Secure $9.99 payment via Stripe Checkout (planned)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-jbs-blue mt-0.5 shrink-0">→</span>
                  JBS-branded Application for Payment PDF (planned)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-jbs-blue mt-0.5 shrink-0">→</span>
                  Download link delivered to <strong>{form.email || 'your email'}</strong> (planned)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-jbs-blue mt-0.5 shrink-0">→</span>
                  Copy delivered to JBS Accounts Payable (planned)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-jbs-blue mt-0.5 shrink-0">→</span>
                  Submission stored in the JBS database
                </li>
              </ul>
            </div>

            {/* Application summary */}
            <div className="border border-jbs-dark/10 p-6 space-y-4">
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal/50">
                Application Summary
              </p>
              <div className="divide-y divide-jbs-dark/8">
                <SummaryLine label="Subcontractor"     value={form.companyName || '—'} />
                <SummaryLine label="Project"           value={form.projectName  || '—'} />
                <SummaryLine label="Application No."   value={form.applicationNumber || '—'} />
                <SummaryLine label="Period To"         value={form.periodTo     || '—'} />
                <SummaryLine label="Current Payment Due" value={fmtUSD(currentDue)} bold accent />
              </div>
            </div>

            {/* Fee + disabled button */}
            <div>
              <div className="flex items-center justify-between border border-jbs-dark/10 px-5 py-4 mb-4">
                <span className="font-heading text-sm uppercase tracking-wider text-jbs-charcoal">
                  Application for Payment Fee
                </span>
                <span className="font-heading text-xl text-jbs-dark">$9.99</span>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-4 bg-jbs-dark/15 text-jbs-gray font-heading text-sm uppercase tracking-widest cursor-not-allowed border border-jbs-dark/10"
              >
                Pay $9.99 — Generate Application for Payment
              </button>
              <p className="text-center text-jbs-gray/60 text-xs mt-3 font-heading uppercase tracking-wider">
                Payment integration not yet active &mdash; UI prototype only
              </p>
            </div>

            {/* Contact info */}
            <div className="border border-jbs-dark/10 p-5">
              <p className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal mb-2">
                Questions?
              </p>
              <p className="text-sm text-jbs-charcoal/60 leading-relaxed">
                For assistance with payment applications, contact the JBS Accounts Payable team at{' '}
                <span className="text-jbs-blue">accounting@buildwithjbs.com</span> or call the main
                office.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-jbs-dark/10">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal hover:text-jbs-blue transition-colors flex items-center gap-2 py-3 px-5 border border-jbs-dark/15 hover:border-jbs-blue"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={goNext}
            className="font-heading text-xs uppercase tracking-widest text-white bg-jbs-blue hover:bg-jbs-blue/90 transition-colors py-3 px-8"
          >
            Next →
          </button>
        ) : step === 6 ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!API_URL || submitting}
            className={`font-heading text-xs uppercase tracking-widest py-3 px-8 transition-colors ${
              !API_URL || submitting
                ? 'bg-jbs-dark/15 text-jbs-gray cursor-not-allowed border border-jbs-dark/10'
                : 'text-white bg-jbs-blue hover:bg-jbs-blue/90'
            }`}
          >
            {submitting ? 'Submitting…' : API_URL ? 'Submit Application →' : 'Submission Disabled'}
          </button>
        ) : (
          <button
            type="button"
            onClick={goBack}
            className="font-heading text-xs uppercase tracking-widest text-jbs-charcoal hover:text-jbs-blue transition-colors py-3 px-5 border border-jbs-dark/15 hover:border-jbs-blue"
          >
            ← Back to Review
          </button>
        )}
      </div>
    </div>
  );
}
