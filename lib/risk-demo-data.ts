/**
 * Demo data for the Risk Management Overview tab.
 *
 * Used to make the dashboard look populated on a fresh demo account. These risks
 * are merged into the Overview tab ONLY — the Register and Library tabs always
 * reflect real Supabase data.
 *
 * IDs use the prefix "demo-" so they cannot collide with real UUIDs.
 */

import type { RiskRow, StatusHistoryRow } from "@/components/risks/types";

const ORG = "demo-org";
const BLANK_PROFILE = (id: string, name: string) => ({ id, full_name: name, avatar_url: null });

// People referenced as owners in demo data.
const PEOPLE = {
    chandrika: { id: "demo-user-chandrika", name: "Chandrika S" },
    priya:     { id: "demo-user-priya",     name: "Priya Iyer" },
    sanjay:    { id: "demo-user-sanjay",    name: "Sanjay Reddy" },
    aarav:     { id: "demo-user-aarav",     name: "Aarav Sharma" },
    meera:     { id: "demo-user-meera",     name: "Meera Patel" },
};

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(NOW - days * DAY).toISOString();

interface DemoSpec {
    libraryId: string;          // matches RSK-XXX-### in lib/risk-library.ts
    title: string;
    category: string;
    description: string;
    likelihood: number;
    impact: number;
    status: "open" | "in_progress" | "mitigated" | "accepted" | "transferred" | "closed";
    treatment: "mitigate" | "accept" | "transfer" | "avoid" | null;
    residual?: { l: number; i: number };
    owner?: { id: string; name: string } | null;
    dueDays?: number;            // due in N days from now (negative = overdue)
    frameworks: { framework: "iso27001" | "soc2" | "hipaa" | "gdpr" | "dpdp"; clause: string; name: string }[];
    notes?: string;
    addedDays: number;           // created N days ago
}

const SPECS: DemoSpec[] = [
    // ── Critical (score ≥ 20) ──
    {
        libraryId: "RSK-HR-001",
        title: "No structured offboarding — departing employees retain access",
        category: "HR Security",
        description: "Leavers' SaaS and VPN credentials remain active for days after their last day, creating a window for data theft or accidental access.",
        likelihood: 5, impact: 4,
        status: "in_progress", treatment: "mitigate",
        owner: PEOPLE.aarav, dueDays: 14, addedDays: 32,
        frameworks: [
            { framework: "iso27001", clause: "A.6.5", name: "Responsibilities after termination or change of employment" },
            { framework: "soc2", clause: "CC6.2", name: "Access removal" },
        ],
        notes: "SCIM rollout in progress for the top 5 SaaS apps.",
    },
    {
        libraryId: "RSK-DAT-001",
        title: "No Record of Processing Activities (RoPA)",
        category: "Data Management",
        description: "There is no inventory describing what personal data is collected, why, where it lives, or how long it is retained.",
        likelihood: 5, impact: 4,
        status: "in_progress", treatment: "mitigate",
        owner: PEOPLE.priya, dueDays: 21, addedDays: 28,
        frameworks: [
            { framework: "gdpr", clause: "Art. 30", name: "Records of processing activities" },
            { framework: "dpdp", clause: "S. 8(1)", name: "Obligations of data fiduciary" },
        ],
        notes: "First draft mapped 12 of 18 systems.",
    },
    {
        libraryId: "RSK-INC-001",
        title: "Delayed incident detection",
        category: "Incident Management",
        description: "Logs were not centralised; security events went undetected for weeks. SIEM rolled out Q1.",
        likelihood: 4, impact: 5,
        status: "mitigated", treatment: "mitigate",
        residual: { l: 2, i: 3 },
        owner: PEOPLE.sanjay, addedDays: 60,
        frameworks: [
            { framework: "iso27001", clause: "A.8.16", name: "Monitoring activities" },
            { framework: "soc2", clause: "CC7.2", name: "System monitoring" },
            { framework: "hipaa", clause: "164.308(a)(1)(ii)(D)", name: "Information system activity review" },
        ],
        notes: "SIEM live with 24/7 MSSP triage. Mean-time-to-detect 4h.",
    },
    {
        libraryId: "RSK-AI-001",
        title: "Use of public LLMs without governance",
        category: "AI & Emerging Technology",
        description: "Engineering and support teams paste customer data into public AI tools to summarise tickets.",
        likelihood: 5, impact: 4,
        status: "open", treatment: null,
        owner: PEOPLE.chandrika, dueDays: 7, addedDays: 12,
        frameworks: [
            { framework: "iso27001", clause: "A.5.10", name: "Acceptable use of information" },
            { framework: "soc2", clause: "CC1.4", name: "Personnel competence" },
            { framework: "gdpr", clause: "Art. 32", name: "Security of processing" },
        ],
    },
    {
        libraryId: "RSK-CHG-001",
        title: "No segregation between development and production",
        category: "Change Management",
        description: "Two engineers had write access to prod databases. Changes deployed without PR review.",
        likelihood: 4, impact: 5,
        status: "mitigated", treatment: "mitigate",
        residual: { l: 1, i: 4 },
        owner: PEOPLE.aarav, addedDays: 90,
        frameworks: [
            { framework: "iso27001", clause: "A.8.31", name: "Separation of development, test and production environments" },
            { framework: "soc2", clause: "CC8.1", name: "Change management" },
        ],
        notes: "Direct prod write removed. CD pipeline now mandatory.",
    },
    {
        libraryId: "RSK-OPS-001",
        title: "Use of end-of-life (EOL) software",
        category: "Operational Security",
        description: "Two internal services run on Ubuntu 18.04, EOL since April 2023.",
        likelihood: 4, impact: 5,
        status: "in_progress", treatment: "mitigate",
        owner: PEOPLE.meera, dueDays: -3, addedDays: 75,
        frameworks: [
            { framework: "iso27001", clause: "A.8.8", name: "Management of technical vulnerabilities" },
            { framework: "soc2", clause: "CC7.1", name: "System operations" },
        ],
        notes: "Migration to 22.04 90% complete.",
    },
    {
        libraryId: "RSK-BCM-001",
        title: "Backup and recovery procedures never tested",
        category: "Business Continuity",
        description: "Backups have run for 18 months but a restore drill has never been performed.",
        likelihood: 4, impact: 5,
        status: "in_progress", treatment: "mitigate",
        owner: PEOPLE.sanjay, dueDays: 30, addedDays: 45,
        frameworks: [
            { framework: "iso27001", clause: "A.5.30", name: "ICT readiness for business continuity" },
            { framework: "soc2", clause: "CC9.1", name: "Disaster recovery" },
            { framework: "hipaa", clause: "164.308(a)(7)", name: "Contingency plan" },
        ],
    },
    {
        libraryId: "RSK-PRV-001",
        title: "Failure to obtain valid consent before collecting personal data",
        category: "Privacy",
        description: "Cookie banner uses a single OK button without granular consent.",
        likelihood: 4, impact: 5,
        status: "open", treatment: null,
        owner: PEOPLE.priya, dueDays: 28, addedDays: 18,
        frameworks: [
            { framework: "gdpr", clause: "Art. 7", name: "Conditions for consent" },
            { framework: "dpdp", clause: "S. 6", name: "Consent" },
        ],
    },
    {
        libraryId: "RSK-GOV-001",
        title: "Unclear information security roles and responsibilities",
        category: "Governance & Leadership",
        description: "No CISO; security tasks scattered across DevOps and Legal.",
        likelihood: 5, impact: 4,
        status: "mitigated", treatment: "mitigate",
        residual: { l: 2, i: 3 },
        owner: PEOPLE.chandrika, addedDays: 110,
        frameworks: [
            { framework: "iso27001", clause: "A.5.2", name: "Information security roles and responsibilities" },
            { framework: "soc2", clause: "CC1.3", name: "Organisational structure" },
        ],
        notes: "Security lead appointed Mar 2026. RACI published.",
    },
    {
        libraryId: "RSK-RM-001",
        title: "Risk treatment plans assigned but never executed",
        category: "Risk Management",
        description: "Q4 register had 14 risks marked for mitigation; only 4 were closed by year-end.",
        likelihood: 4, impact: 4,
        status: "open", treatment: null,
        owner: PEOPLE.chandrika, dueDays: -7, addedDays: 22,
        frameworks: [
            { framework: "iso27001", clause: "Cl. 6.1.3", name: "Information security risk treatment" },
            { framework: "iso27001", clause: "Cl. 8.3", name: "Information security risk treatment" },
        ],
    },
    // ── High (12-19) ──
    {
        libraryId: "RSK-VEN-002",
        title: "No Data Processing Agreement (DPA) with vendors",
        category: "Vendor Management",
        description: "12 of 23 SaaS vendors processing personal data have no signed DPA.",
        likelihood: 4, impact: 4,
        status: "in_progress", treatment: "mitigate",
        owner: PEOPLE.priya, dueDays: 45, addedDays: 38,
        frameworks: [
            { framework: "iso27001", clause: "A.5.19", name: "Information security in supplier relationships" },
            { framework: "gdpr", clause: "Art. 28", name: "Processor obligations" },
            { framework: "dpdp", clause: "S. 8(2)", name: "Use of data processors" },
        ],
        notes: "Legal sent DPAs to 8 vendors; awaiting signature.",
    },
    {
        libraryId: "RSK-FRD-001",
        title: "Unauthorised financial transactions",
        category: "Fraud",
        description: "Vendor bank-detail change emails go straight to AP without callback.",
        likelihood: 3, impact: 5,
        status: "open", treatment: null,
        owner: PEOPLE.meera, dueDays: 14, addedDays: 9,
        frameworks: [
            { framework: "iso27001", clause: "A.5.3", name: "Segregation of duties" },
            { framework: "soc2", clause: "CC1.4", name: "Personnel competence" },
        ],
    },
    {
        libraryId: "RSK-CLS-001",
        title: "Personal data in non-production environments without masking",
        category: "Information Classification",
        description: "Engineering test DB contains a live snapshot of production users.",
        likelihood: 4, impact: 4,
        status: "open", treatment: null,
        owner: PEOPLE.aarav, dueDays: 60, addedDays: 16,
        frameworks: [
            { framework: "iso27001", clause: "A.8.33", name: "Test information" },
            { framework: "gdpr", clause: "Art. 32", name: "Security of processing" },
        ],
    },
    {
        libraryId: "RSK-VEN-005",
        title: "Critical vendor without business-continuity plan",
        category: "Vendor Management",
        description: "Primary payments vendor will not share its DR posture under NDA.",
        likelihood: 3, impact: 5,
        status: "accepted", treatment: "accept",
        owner: PEOPLE.sanjay, addedDays: 50,
        frameworks: [
            { framework: "iso27001", clause: "A.5.30", name: "ICT readiness for business continuity" },
            { framework: "soc2", clause: "A1.2", name: "Recovery planning" },
        ],
        notes: "Risk accepted by leadership; secondary processor in evaluation Q3.",
    },
    {
        libraryId: "RSK-LEG-002",
        title: "No DPO/Privacy lead designated",
        category: "Legal & Compliance",
        description: "GDPR/DPDP responsibilities not assigned to a named person.",
        likelihood: 4, impact: 4,
        status: "transferred", treatment: "transfer",
        owner: PEOPLE.chandrika, addedDays: 42,
        frameworks: [
            { framework: "gdpr", clause: "Art. 37", name: "Designation of the data protection officer" },
            { framework: "dpdp", clause: "S. 10", name: "Data Protection Officer" },
        ],
        notes: "External DPO appointed via PrivacyCo Ltd. Contract effective Apr 1.",
    },
    // ── Medium (6-11) ──
    {
        libraryId: "RSK-CHG-003",
        title: "Emergency changes bypass normal controls",
        category: "Change Management",
        description: "Hot-fixes go straight to prod without code review during incidents.",
        likelihood: 3, impact: 4,
        status: "accepted", treatment: "accept",
        owner: PEOPLE.aarav, addedDays: 25,
        frameworks: [
            { framework: "iso27001", clause: "A.8.32", name: "Change management" },
            { framework: "soc2", clause: "CC8.1", name: "Change management" },
        ],
        notes: "Risk-accepted within 48-hour-review tolerance for severity-1 hotfixes.",
    },
    {
        libraryId: "RSK-AI-003",
        title: "Inadequate AI model risk assessment",
        category: "AI & Emerging Technology",
        description: "Recommendation engine retrained quarterly with no bias evaluation.",
        likelihood: 3, impact: 4,
        status: "open", treatment: null,
        owner: PEOPLE.priya, dueDays: 90, addedDays: 8,
        frameworks: [
            { framework: "iso27001", clause: "A.5.7", name: "Threat intelligence" },
            { framework: "gdpr", clause: "Art. 22", name: "Automated individual decision-making" },
        ],
    },
    {
        libraryId: "RSK-COM-001",
        title: "Sensitive information discussed in public spaces",
        category: "Communications Security",
        description: "Engineering syncs sometimes happen in shared coworking lounges.",
        likelihood: 4, impact: 3,
        status: "open", treatment: null,
        owner: PEOPLE.meera, dueDays: 30, addedDays: 5,
        frameworks: [
            { framework: "iso27001", clause: "A.5.13", name: "Labelling of information" },
            { framework: "iso27001", clause: "A.7.7", name: "Clear desk and clear screen" },
        ],
    },
];

// ───────────────────────────────────────────────────────────────────────────
// Build RiskRow records from specs
// ───────────────────────────────────────────────────────────────────────────

export const DEMO_RISKS: RiskRow[] = SPECS.map((s, idx) => {
    const id = `demo-risk-${String(idx + 1).padStart(3, "0")}`;
    const due_date = s.dueDays === undefined ? null : new Date(NOW + s.dueDays * DAY).toISOString().slice(0, 10);
    const created_at = ago(s.addedDays);
    const residual_likelihood = s.residual?.l ?? null;
    const residual_impact = s.residual?.i ?? null;
    const residual_score = residual_likelihood && residual_impact ? residual_likelihood * residual_impact : null;
    return {
        id,
        org_id: ORG,
        title: s.title,
        category: s.category,
        description: s.description,
        likelihood: s.likelihood,
        impact: s.impact,
        risk_score: s.likelihood * s.impact,
        status: s.status,
        owner_id: s.owner?.id ?? null,
        mitigation: null,
        due_date,
        source: "manual",
        source_ref: null,
        control_id: null,
        display_id: s.libraryId,
        library_risk_id: s.libraryId,
        treatment: s.treatment,
        residual_likelihood,
        residual_impact,
        residual_score,
        framework_mappings: s.frameworks as unknown as RiskRow["framework_mappings"],
        recommendation: null,
        notes: s.notes ?? null,
        created_at,
        updated_at: created_at,
        profiles: s.owner ? BLANK_PROFILE(s.owner.id, s.owner.name) : null,
    };
});

// ───────────────────────────────────────────────────────────────────────────
// Activity feed (status-history rows referencing the demo risks above)
// ───────────────────────────────────────────────────────────────────────────

interface HistorySpec {
    riskIdx: number;            // index into SPECS / DEMO_RISKS
    field: string;
    from: string | null;
    to: string | null;
    by: { id: string; name: string };
    daysAgo: number;
    note?: string;
}

const HIST_SPECS: HistorySpec[] = [
    { riskIdx: 1,  field: "status",     from: "open",        to: "in_progress",   by: PEOPLE.priya,     daysAgo: 3,  note: "RoPA mapping kicked off." },
    { riskIdx: 2,  field: "status",     from: "in_progress", to: "mitigated",     by: PEOPLE.sanjay,    daysAgo: 5,  note: "SIEM in production with 24/7 triage." },
    { riskIdx: 4,  field: "treatment",  from: null,          to: "mitigate",      by: PEOPLE.aarav,     daysAgo: 7 },
    { riskIdx: 10, field: "likelihood", from: "5",           to: "4",             by: PEOPLE.chandrika, daysAgo: 10, note: "8 of 12 DPAs returned signed." },
    { riskIdx: 14, field: "status",     from: "open",        to: "in_progress",   by: PEOPLE.priya,     daysAgo: 12 },
    { riskIdx: 5,  field: "residual_impact", from: null,     to: "4",             by: PEOPLE.meera,     daysAgo: 14, note: "Post-treatment residual rated by infra." },
    { riskIdx: 8,  field: "status",     from: "open",        to: "mitigated",     by: PEOPLE.chandrika, daysAgo: 18, note: "Security lead appointed; RACI signed off." },
    { riskIdx: 0,  field: "owner_id",   from: null,          to: PEOPLE.aarav.id, by: PEOPLE.chandrika, daysAgo: 22 },
    { riskIdx: 3,  field: "status",     from: null,          to: "open",          by: PEOPLE.chandrika, daysAgo: 25, note: "Added from library after Shadow AI review." },
    { riskIdx: 7,  field: "status",     from: null,          to: "open",          by: PEOPLE.priya,     daysAgo: 28 },
];

export const DEMO_HISTORY: StatusHistoryRow[] = HIST_SPECS.map((h, idx) => ({
    id: `demo-hist-${String(idx + 1).padStart(3, "0")}`,
    risk_id: DEMO_RISKS[h.riskIdx]?.id ?? "demo-risk-001",
    field: h.field,
    from_value: h.from,
    to_value: h.to,
    changed_by: h.by.id,
    changed_at: ago(h.daysAgo),
    note: h.note ?? null,
    profiles: BLANK_PROFILE(h.by.id, h.by.name),
}));
