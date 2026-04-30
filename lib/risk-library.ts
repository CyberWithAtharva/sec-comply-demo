/**
 * Overwatch Risk Library — pre-defined risks across 17 categories.
 * Read-only reference data. Spec: Risk_Management_Feature_Doc 1.docx (Apr 2026).
 *
 * Spec note: prose claims 79 risks; the per-category table in §4.1 sums to 68.
 * This file follows the per-category counts (authoritative) — total 68 risks.
 *
 * When a client adds a library risk to their register, the relevant fields are
 * COPIED into the risks row at insert time (snapshot). Library edits do NOT
 * retroactively update register entries.
 */

export type Framework = "iso27001" | "soc2" | "hipaa" | "gdpr" | "dpdp";

export interface FrameworkMapping {
    framework: Framework;
    clause: string;        // e.g. "A.5.30"
    name: string;          // e.g. "ICT readiness for business continuity"
}

export interface LibraryRisk {
    id: string;                                         // e.g. "RSK-VEN-002"
    category: string;                                   // one of CATEGORY_NAMES
    title: string;
    description: string;
    defaultLikelihood: 1 | 2 | 3 | 4 | 5;
    defaultImpact: 1 | 2 | 3 | 4 | 5;
    recommendation: string;
    frameworkMappings: FrameworkMapping[];
}

// ---------------------------------------------------------------------------
// Helpers used by the UI
// ---------------------------------------------------------------------------

export const FRAMEWORK_LABELS: Record<Framework, string> = {
    iso27001: "ISO 27001",
    soc2: "SOC 2",
    hipaa: "HIPAA",
    gdpr: "GDPR",
    dpdp: "DPDP",
};

export const FRAMEWORK_BADGE_COLORS: Record<Framework, string> = {
    iso27001: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    soc2:     "bg-purple-500/10 text-purple-300 border-purple-500/20",
    hipaa:    "bg-teal-500/10 text-teal-300 border-teal-500/20",
    gdpr:     "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    dpdp:     "bg-orange-500/10 text-orange-300 border-orange-500/20",
};

export interface CategorySummary {
    name: string;
    count: number;        // expected count per spec §4.1
}

export const CATEGORIES: readonly CategorySummary[] = [
    { name: "AI & Emerging Technology", count: 4 },
    { name: "Asset Management", count: 3 },
    { name: "Business Continuity", count: 4 },
    { name: "Change Management", count: 3 },
    { name: "Communications Security", count: 1 },
    { name: "Data Management", count: 5 },
    { name: "Fraud", count: 2 },
    { name: "Governance & Leadership", count: 5 },
    { name: "HR Security", count: 7 },
    { name: "Incident Management", count: 5 },
    { name: "Information Classification", count: 3 },
    { name: "Legal & Compliance", count: 4 },
    { name: "Operational Security", count: 3 },
    { name: "Physical Security", count: 5 },
    { name: "Privacy", count: 6 },
    { name: "Risk Management", count: 2 },
    { name: "Vendor Management", count: 6 },
] as const;

// ---------------------------------------------------------------------------
// Common framework-mapping shorthands (avoid retyping)
// ---------------------------------------------------------------------------

const FM = {
    iso: (clause: string, name: string): FrameworkMapping => ({ framework: "iso27001", clause, name }),
    soc: (clause: string, name: string): FrameworkMapping => ({ framework: "soc2",     clause, name }),
    hip: (clause: string, name: string): FrameworkMapping => ({ framework: "hipaa",    clause, name }),
    gdp: (clause: string, name: string): FrameworkMapping => ({ framework: "gdpr",     clause, name }),
    dpd: (clause: string, name: string): FrameworkMapping => ({ framework: "dpdp",     clause, name }),
};

// ---------------------------------------------------------------------------
// The library — grouped by category, in spec order
// ---------------------------------------------------------------------------

export const RISK_LIBRARY: LibraryRisk[] = [
    // ─── AI & Emerging Technology (4) ─────────────────────────────────────
    {
        id: "RSK-AI-001",
        category: "AI & Emerging Technology",
        title: "Use of public LLMs without governance",
        description: "Employees use public AI tools (ChatGPT, Gemini, etc.) for work tasks and inadvertently paste sensitive data — customer information, source code, financial records — into prompts that train external models.",
        defaultLikelihood: 5, defaultImpact: 4,
        recommendation: "1) Publish an Acceptable AI Use policy. 2) Block known consumer AI domains at the network egress for production environments. 3) Provide a sanctioned enterprise AI tool with data-loss controls. 4) Train employees on what data must never be shared with external models. 5) Log and review AI tool usage at least quarterly.",
        frameworkMappings: [FM.iso("A.5.10", "Acceptable use of information"), FM.soc("CC1.4", "Personnel competence"), FM.gdp("Art. 32", "Security of processing")],
    },
    {
        id: "RSK-AI-002",
        category: "AI & Emerging Technology",
        title: "AI-generated code introduced without review",
        description: "Developers commit AI-generated code into production without security review, introducing vulnerabilities, license-tainted snippets, or hallucinated dependencies that can be hijacked (slopsquatting).",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Require human review on every AI-assisted PR. 2) Run SAST + dependency scanners on every commit. 3) Block direct merges to main; mandate at least one approving reviewer. 4) Maintain an SBOM and verify all listed packages exist on official registries.",
        frameworkMappings: [FM.iso("A.8.28", "Secure coding"), FM.soc("CC8.1", "Change management")],
    },
    {
        id: "RSK-AI-003",
        category: "AI & Emerging Technology",
        title: "Inadequate AI model risk assessment",
        description: "Internal AI/ML models are deployed without bias testing, accuracy thresholds, or fallback procedures, leading to discriminatory outcomes or critical decisions made on faulty inferences.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Document the intended use of every AI model. 2) Test for bias across protected attributes before release. 3) Define accuracy thresholds and a fallback/human-in-the-loop process for low-confidence outputs. 4) Re-evaluate models at least annually.",
        frameworkMappings: [FM.iso("A.5.7", "Threat intelligence"), FM.gdp("Art. 22", "Automated individual decision-making")],
    },
    {
        id: "RSK-AI-004",
        category: "AI & Emerging Technology",
        title: "Shadow AI agents accessing internal systems",
        description: "Employees deploy autonomous AI agents (browser plugins, API integrations) that access corporate SaaS apps using their credentials, creating an unauthorised data path with no audit trail.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Inventory active OAuth integrations across critical SaaS apps. 2) Block unsanctioned third-party plugins. 3) Require admin approval for any new integration with workforce data. 4) Monitor for unusual API access patterns from AI clients.",
        frameworkMappings: [FM.iso("A.5.19", "Information security in supplier relationships"), FM.soc("CC6.1", "Logical access")],
    },

    // ─── Asset Management (3) ─────────────────────────────────────────────
    {
        id: "RSK-AST-001",
        category: "Asset Management",
        title: "No IT asset inventory",
        description: "There is no authoritative list of devices, software, and cloud resources connected to the organisation's network. Unknown assets cannot be patched, monitored, or decommissioned, creating a persistent attack surface.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Stand up a CMDB or use the cloud provider's native inventory. 2) Onboard every laptop and server through a defined provisioning workflow. 3) Reconcile inventory at least monthly against authentication logs and network scans. 4) Tag every asset with an owner.",
        frameworkMappings: [FM.iso("A.5.9", "Inventory of information and other associated assets"), FM.soc("CC6.1", "Logical access controls")],
    },
    {
        id: "RSK-AST-002",
        category: "Asset Management",
        title: "Lost/stolen assets not deactivated promptly",
        description: "When devices are lost or stolen, accounts and certificates remain active, allowing whoever holds the device to access company data.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Mandate immediate reporting of lost/stolen devices. 2) Use MDM to remotely wipe and revoke certificates. 3) Reset the user's passwords and OAuth tokens. 4) Track time-to-deactivate as a metric.",
        frameworkMappings: [FM.iso("A.5.11", "Return of assets"), FM.soc("CC6.5", "Asset disposal")],
    },
    {
        id: "RSK-AST-003",
        category: "Asset Management",
        title: "Insecure asset disposal",
        description: "Decommissioned hardware (laptops, drives, mobile devices) is disposed without verified data destruction, leading to leakage of residual data.",
        defaultLikelihood: 3, defaultImpact: 3,
        recommendation: "1) Maintain a documented disposal procedure (cryptographic erase, physical destruction, or certified recycler). 2) Track each asset's disposal with a certificate of destruction. 3) Periodically audit disposal records.",
        frameworkMappings: [FM.iso("A.7.14", "Secure disposal or re-use of equipment"), FM.hip("164.310(d)", "Device and media controls")],
    },

    // ─── Business Continuity (4) ──────────────────────────────────────────
    {
        id: "RSK-BCM-001",
        category: "Business Continuity",
        title: "Backup and recovery procedures never tested",
        description: "Backups exist but have never been restored. When an actual incident requires recovery, restores fail, take far longer than the RTO, or restore corrupted data.",
        defaultLikelihood: 4, defaultImpact: 5,
        recommendation: "1) Schedule quarterly restore drills against a non-production environment. 2) Define and measure RTO/RPO for every critical system. 3) Document the recovery runbook and the most recent successful restore date. 4) Store at least one immutable copy off-site.",
        frameworkMappings: [FM.iso("A.5.30", "ICT readiness for business continuity"), FM.soc("CC9.1", "Disaster recovery"), FM.hip("164.308(a)(7)", "Contingency plan")],
    },
    {
        id: "RSK-BCM-002",
        category: "Business Continuity",
        title: "No documented business continuity plan",
        description: "There is no written plan describing how the business will operate during a major disruption — power outage, cloud-region failure, ransomware, supply-chain shock — leading to ad-hoc, slow, costly response.",
        defaultLikelihood: 3, defaultImpact: 5,
        recommendation: "1) Identify critical business processes and the systems they depend on. 2) Document a BCP including RTOs, alternative work arrangements, and communication plans. 3) Run a tabletop exercise annually. 4) Update the plan after every incident.",
        frameworkMappings: [FM.iso("A.5.29", "Information security during disruption"), FM.soc("A1.2", "Recovery planning")],
    },
    {
        id: "RSK-BCM-003",
        category: "Business Continuity",
        title: "Single-region cloud deployment without DR",
        description: "Production runs in one cloud region with no disaster-recovery posture. A regional outage halts the business for hours or days.",
        defaultLikelihood: 2, defaultImpact: 5,
        recommendation: "1) Decide tier-by-tier whether multi-AZ, multi-region, or cold-DR is required. 2) Replicate critical data continuously to a second region. 3) Document and test fail-over. 4) Validate cost vs RTO trade-off with leadership.",
        frameworkMappings: [FM.iso("A.5.30", "ICT readiness for business continuity"), FM.soc("A1.2", "Recovery planning")],
    },
    {
        id: "RSK-BCM-004",
        category: "Business Continuity",
        title: "Key-person dependency with no cross-training",
        description: "Critical operational knowledge — production deploys, security incident response, finance reconciliations — lives in a single individual's head. Their absence stops or breaks the business.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Map single-points-of-knowledge per process. 2) Document runbooks and require pair-on-deploys. 3) Cross-train at least one secondary owner per critical workflow. 4) Schedule planned absence drills.",
        frameworkMappings: [FM.iso("A.6.3", "Information security awareness, education and training"), FM.soc("CC1.4", "Personnel competence")],
    },

    // ─── Change Management (3) ────────────────────────────────────────────
    {
        id: "RSK-CHG-001",
        category: "Change Management",
        title: "No segregation between development and production",
        description: "Developers have direct write access to production databases and services. Buggy or malicious changes reach customers without any review gate.",
        defaultLikelihood: 4, defaultImpact: 5,
        recommendation: "1) Separate dev / staging / prod environments with distinct credentials. 2) Require pull-request review before any prod deploy. 3) Audit all break-glass production access. 4) Eliminate shared admin accounts.",
        frameworkMappings: [FM.iso("A.8.31", "Separation of development, test and production environments"), FM.soc("CC8.1", "Change management")],
    },
    {
        id: "RSK-CHG-002",
        category: "Change Management",
        title: "Untracked production changes",
        description: "Configuration and code changes are made directly to production without a ticket, approval, or deployment record. Audit and rollback become impossible after an incident.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Route all production changes through a single CD pipeline. 2) Require a linked ticket and approver per change. 3) Retain deployment records for at least 12 months. 4) Disable interactive shell access on prod where possible.",
        frameworkMappings: [FM.iso("A.8.32", "Change management"), FM.soc("CC8.1", "Change management")],
    },
    {
        id: "RSK-CHG-003",
        category: "Change Management",
        title: "Emergency changes bypass normal controls",
        description: "Hot-fixes and emergency releases skip code review and testing, introducing regressions and security flaws into production.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Document an emergency-change policy with at least one peer approver and a post-incident review. 2) Require all emergency changes to be re-reviewed within 5 business days. 3) Track frequency of emergency changes — high counts signal pipeline gaps.",
        frameworkMappings: [FM.iso("A.8.32", "Change management"), FM.soc("CC8.1", "Change management")],
    },

    // ─── Communications Security (1) ──────────────────────────────────────
    {
        id: "RSK-COM-001",
        category: "Communications Security",
        title: "Sensitive information discussed in public spaces",
        description: "Confidential business and customer information is discussed in coffee shops, on public transport, or on calls in shared spaces, where it can be overheard or recorded.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Train employees on confidentiality expectations during onboarding and annually. 2) Provide privacy filters for laptops used in public. 3) Discourage video calls in open public areas; provide quiet rooms or remote-work guidance.",
        frameworkMappings: [FM.iso("A.5.13", "Labelling of information"), FM.iso("A.7.7", "Clear desk and clear screen")],
    },

    // ─── Data Management (5) ──────────────────────────────────────────────
    {
        id: "RSK-DAT-001",
        category: "Data Management",
        title: "No Record of Processing Activities (RoPA)",
        description: "There is no inventory describing what personal data is collected, why, where it lives, who has access, and how long it is retained — a baseline obligation under GDPR and DPDP.",
        defaultLikelihood: 5, defaultImpact: 4,
        recommendation: "1) Map every system that holds personal data and document purpose, lawful basis, retention, and recipients. 2) Assign a RoPA owner. 3) Review quarterly when new systems are added. 4) Make RoPA available to the regulator on request.",
        frameworkMappings: [FM.gdp("Art. 30", "Records of processing activities"), FM.dpd("S. 8(1)", "Obligations of data fiduciary")],
    },
    {
        id: "RSK-DAT-002",
        category: "Data Management",
        title: "Data retained beyond defined retention periods",
        description: "Personal and business data is kept indefinitely — increasing breach blast radius and violating retention requirements under privacy law.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Define retention periods per data category in a Data Retention Policy. 2) Implement automated deletion or archival jobs. 3) Audit live datasets quarterly for over-retained records. 4) Document legal-hold exceptions.",
        frameworkMappings: [FM.iso("A.8.10", "Information deletion"), FM.gdp("Art. 5(1)(e)", "Storage limitation"), FM.dpd("S. 8(7)", "Erasure of personal data")],
    },
    {
        id: "RSK-DAT-003",
        category: "Data Management",
        title: "Sensitive data stored unencrypted at rest",
        description: "Customer or financial data resides in databases, object storage, or backups without encryption, exposing it on disk theft, mis-configured access, or vendor compromise.",
        defaultLikelihood: 3, defaultImpact: 5,
        recommendation: "1) Enable encryption at rest on every datastore (default AES-256 on managed services). 2) Enforce TLS for all data in transit. 3) Manage keys in a dedicated KMS with separation of duties. 4) Verify configuration via continuous CSPM checks.",
        frameworkMappings: [FM.iso("A.8.24", "Use of cryptography"), FM.soc("CC6.7", "Data transmission security"), FM.hip("164.312(a)(2)(iv)", "Encryption and decryption")],
    },
    {
        id: "RSK-DAT-004",
        category: "Data Management",
        title: "No data classification scheme in use",
        description: "Without classification labels, employees and systems treat all data the same, leading to over-sharing of sensitive data and under-protection of regulated data.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Adopt a 3-tier classification scheme (Public / Internal / Confidential / Restricted). 2) Train staff to label documents and emails. 3) Apply DLP rules per label.",
        frameworkMappings: [FM.iso("A.5.12", "Classification of information"), FM.soc("CC6.1", "Logical access controls")],
    },
    {
        id: "RSK-DAT-005",
        category: "Data Management",
        title: "Data shared with third parties without safeguards",
        description: "Files, datasets, or extracts are sent to vendors or partners over insecure channels (personal email, public links) and without contractual data-protection terms.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Require encrypted transfer for any data leaving the organisation. 2) Use a sanctioned file-transfer tool with logging. 3) Sign DPAs with all data recipients. 4) Track every data-sharing arrangement.",
        frameworkMappings: [FM.iso("A.5.14", "Information transfer"), FM.gdp("Art. 28", "Processor obligations")],
    },

    // ─── Fraud (2) ────────────────────────────────────────────────────────
    {
        id: "RSK-FRD-001",
        category: "Fraud",
        title: "Unauthorised financial transactions",
        description: "Payments are made or vendor bank details changed without proper approval controls, allowing employee fraud or external business-email-compromise (BEC) attacks to succeed.",
        defaultLikelihood: 3, defaultImpact: 5,
        recommendation: "1) Require dual approval for payments above a defined threshold. 2) Verify any vendor bank-detail change through an out-of-band callback. 3) Train finance staff on BEC red-flags. 4) Periodically reconcile vendor master file.",
        frameworkMappings: [FM.iso("A.5.3", "Segregation of duties"), FM.soc("CC1.4", "Personnel competence")],
    },
    {
        id: "RSK-FRD-002",
        category: "Fraud",
        title: "Expense and reimbursement fraud",
        description: "Expenses are claimed without supporting receipts, with inflated amounts, or for personal purchases, draining funds and signalling weak finance controls.",
        defaultLikelihood: 3, defaultImpact: 2,
        recommendation: "1) Require receipt upload for every claim above a low threshold. 2) Sample-audit expense claims monthly. 3) Implement automated duplicate-detection. 4) Publish an anti-fraud policy with confidential reporting channel.",
        frameworkMappings: [FM.iso("A.5.4", "Management responsibilities"), FM.soc("CC1.5", "Accountability")],
    },

    // ─── Governance & Leadership (5) ──────────────────────────────────────
    {
        id: "RSK-GOV-001",
        category: "Governance & Leadership",
        title: "Unclear information security roles and responsibilities",
        description: "No one owns information security at the organisation; duties are scattered, controls are inconsistent, and incidents are slow to escalate.",
        defaultLikelihood: 5, defaultImpact: 4,
        recommendation: "1) Designate a CISO or accountable security lead. 2) Publish a security RACI covering policy, operations, and incident response. 3) Establish an Information Security Committee with quarterly cadence. 4) Document decisions and minutes.",
        frameworkMappings: [FM.iso("A.5.2", "Information security roles and responsibilities"), FM.soc("CC1.3", "Organisational structure")],
    },
    {
        id: "RSK-GOV-002",
        category: "Governance & Leadership",
        title: "No approved information security policy",
        description: "There is no top-level information security policy approved by leadership, leaving the security programme without a mandate and direction.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Draft a one-page Information Security Policy approved by the CEO or board. 2) Publish supporting policies (Acceptable Use, Access Control, Incident Response). 3) Re-approve at least annually. 4) Communicate to all staff.",
        frameworkMappings: [FM.iso("A.5.1", "Policies for information security"), FM.soc("CC1.1", "Tone at the top")],
    },
    {
        id: "RSK-GOV-003",
        category: "Governance & Leadership",
        title: "No security risk-appetite statement",
        description: "Leadership has not defined what level of cyber and compliance risk is acceptable, leaving each team to make ad-hoc trade-offs.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Define a risk-appetite statement signed by leadership. 2) Cascade specific tolerances per domain (e.g. Critical risks closed within 30 days). 3) Review at least annually with the board.",
        frameworkMappings: [FM.iso("Cl. 6.1.2", "Information security risk assessment"), FM.soc("CC3.1", "Risk identification")],
    },
    {
        id: "RSK-GOV-004",
        category: "Governance & Leadership",
        title: "No security metrics reported to leadership",
        description: "Security posture is invisible to executives — no recurring metrics on incidents, control coverage, or risks — so there is no oversight or budget allocation.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Define 5–10 leading and lagging security KPIs. 2) Report monthly to the security committee and quarterly to the board. 3) Tie metrics to risk-appetite tolerances.",
        frameworkMappings: [FM.iso("Cl. 9.1", "Monitoring, measurement, analysis and evaluation"), FM.soc("CC4.1", "Monitoring activities")],
    },
    {
        id: "RSK-GOV-005",
        category: "Governance & Leadership",
        title: "No defined security awareness programme",
        description: "Employees never receive structured security training; phishing, password hygiene, and incident-reporting habits stay weak.",
        defaultLikelihood: 5, defaultImpact: 3,
        recommendation: "1) Run mandatory security training at onboarding and annually. 2) Conduct quarterly phishing simulations. 3) Track completion rates as a KPI. 4) Provide role-specific deep-dives for engineers, finance, and admins.",
        frameworkMappings: [FM.iso("A.6.3", "Information security awareness, education and training"), FM.soc("CC1.4", "Personnel competence")],
    },

    // ─── HR Security (7) ──────────────────────────────────────────────────
    {
        id: "RSK-HR-001",
        category: "HR Security",
        title: "No structured offboarding — departing employees retain access",
        description: "Leavers' accounts, VPN credentials, and SaaS access remain active for days or weeks after their last day, creating a window for data theft or accidental access.",
        defaultLikelihood: 5, defaultImpact: 4,
        recommendation: "1) Define a same-day offboarding checklist covering identity provider, all SaaS apps, code repos, and physical access. 2) Automate via SCIM/SSO de-provisioning. 3) Audit residual access weekly. 4) Recover all assets and certificates of disposal.",
        frameworkMappings: [FM.iso("A.6.5", "Responsibilities after termination or change of employment"), FM.soc("CC6.2", "Access removal")],
    },
    {
        id: "RSK-HR-002",
        category: "HR Security",
        title: "Background checks not performed",
        description: "New hires take roles with access to sensitive data without verified employment history, criminal record check, or reference checks where legally permissible.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Define a pre-employment screening policy proportionate to role sensitivity. 2) Document checks performed for each hire. 3) Engage a reputable third-party screening provider for critical roles.",
        frameworkMappings: [FM.iso("A.6.1", "Screening"), FM.soc("CC1.4", "Personnel competence")],
    },
    {
        id: "RSK-HR-003",
        category: "HR Security",
        title: "No NDA or confidentiality agreement signed",
        description: "Employees and contractors are not bound by a confidentiality agreement, weakening enforceability when sensitive data is leaked or misused.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Require an NDA / confidentiality clause as part of every offer letter. 2) Maintain signed copies in HR. 3) Re-affirm on role change to higher-trust positions.",
        frameworkMappings: [FM.iso("A.6.2", "Terms and conditions of employment"), FM.soc("CC1.4", "Personnel competence")],
    },
    {
        id: "RSK-HR-004",
        category: "HR Security",
        title: "Insider threats from disgruntled employees",
        description: "An employee under disciplinary action or with imminent departure has high-privilege access and can exfiltrate data or sabotage systems.",
        defaultLikelihood: 3, defaultImpact: 5,
        recommendation: "1) Add HR-driven triggers to remove or step-down access during sensitive HR events. 2) Monitor for unusual data-export volumes. 3) Coordinate offboarding with HR/Legal/Security in advance.",
        frameworkMappings: [FM.iso("A.6.4", "Disciplinary process"), FM.soc("CC1.4", "Personnel competence")],
    },
    {
        id: "RSK-HR-005",
        category: "HR Security",
        title: "Contractors with permanent-staff-equivalent access",
        description: "External contractors retain accounts and elevated access months after their engagement ends, often unmanaged in the identity provider.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Time-bound every contractor account to the contract end date. 2) Use a separate user lifecycle process from staff. 3) Quarterly access review focused on contractors.",
        frameworkMappings: [FM.iso("A.6.5", "Responsibilities after termination or change of employment"), FM.soc("CC6.2", "Access removal")],
    },
    {
        id: "RSK-HR-006",
        category: "HR Security",
        title: "Inadequate role-based onboarding",
        description: "New hires receive blanket access to many systems on day one rather than role-specific entitlements, creating excessive privilege from the start.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Define standard access bundles per role. 2) Require manager approval for any access outside the bundle. 3) Audit onboarding entitlements monthly.",
        frameworkMappings: [FM.iso("A.5.18", "Access rights"), FM.soc("CC6.1", "Logical access controls")],
    },
    {
        id: "RSK-HR-007",
        category: "HR Security",
        title: "No periodic access reviews",
        description: "Once granted, access is rarely reviewed; entitlements accumulate as people change roles, violating the principle of least privilege.",
        defaultLikelihood: 5, defaultImpact: 3,
        recommendation: "1) Conduct quarterly access reviews for sensitive systems and annually for the rest. 2) Document the reviewer and outcomes. 3) Auto-revoke entitlements not affirmed in time.",
        frameworkMappings: [FM.iso("A.5.18", "Access rights"), FM.soc("CC6.3", "Access reviews")],
    },

    // ─── Incident Management (5) ──────────────────────────────────────────
    {
        id: "RSK-INC-001",
        category: "Incident Management",
        title: "Delayed incident detection",
        description: "Security events go unnoticed for extended periods because logs are not collected, alerts are noisy, or no one is responsible for triage. Attackers dwell undetected.",
        defaultLikelihood: 4, defaultImpact: 5,
        recommendation: "1) Centralise logs from cloud, identity, and endpoints into a SIEM. 2) Define detection use-cases tied to MITRE ATT&CK. 3) Assign a 24/7 triage rota or an MSSP. 4) Track mean-time-to-detect as a KPI.",
        frameworkMappings: [FM.iso("A.8.16", "Monitoring activities"), FM.soc("CC7.2", "System monitoring"), FM.hip("164.308(a)(1)(ii)(D)", "Information system activity review")],
    },
    {
        id: "RSK-INC-002",
        category: "Incident Management",
        title: "No incident response plan",
        description: "When a breach happens, there is no defined playbook — roles, communications, escalations are improvised, extending the incident and the damage.",
        defaultLikelihood: 3, defaultImpact: 5,
        recommendation: "1) Document an Incident Response Plan with roles, severity tiers, and communication tree. 2) Pre-draft regulator and customer notifications. 3) Run a tabletop exercise annually. 4) Update after every real incident.",
        frameworkMappings: [FM.iso("A.5.24", "Information security incident management planning and preparation"), FM.soc("CC7.3", "Incident response")],
    },
    {
        id: "RSK-INC-003",
        category: "Incident Management",
        title: "Breach notification deadlines missed",
        description: "Personal-data breaches are not reported to the regulator within the legally mandated window (e.g. 72 hours under GDPR, 'as soon as possible' under DPDP).",
        defaultLikelihood: 3, defaultImpact: 5,
        recommendation: "1) Document each applicable notification deadline by jurisdiction. 2) Define a rapid-decision committee that can authorise notification. 3) Pre-draft notification templates. 4) Simulate the workflow during tabletop exercises.",
        frameworkMappings: [FM.gdp("Art. 33", "Notification of a personal data breach"), FM.dpd("S. 8(6)", "Personal data breach notification")],
    },
    {
        id: "RSK-INC-004",
        category: "Incident Management",
        title: "No post-incident review process",
        description: "Incidents are closed without a structured root-cause analysis or lessons-learned, so similar incidents recur.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Mandate a post-incident review for all severity-1/2 incidents. 2) Capture root cause, contributing factors, and remediation actions. 3) Track remediation actions to closure. 4) Share lessons across the organisation.",
        frameworkMappings: [FM.iso("A.5.27", "Learning from information security incidents"), FM.soc("CC7.4", "Incident post-mortem")],
    },
    {
        id: "RSK-INC-005",
        category: "Incident Management",
        title: "Inadequate forensic readiness",
        description: "When an incident occurs, logs are missing or insufficient to reconstruct what happened, attribution is impossible, and evidence is not admissible.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Define minimum log retention (≥ 90 days hot, 1 year cold). 2) Protect logs from tampering with append-only storage. 3) Document chain-of-custody procedures. 4) Engage a retainer with a forensics firm.",
        frameworkMappings: [FM.iso("A.5.28", "Collection of evidence"), FM.soc("CC7.3", "Incident response")],
    },

    // ─── Information Classification (3) ───────────────────────────────────
    {
        id: "RSK-CLS-001",
        category: "Information Classification",
        title: "Personal data in non-production environments without masking",
        description: "Production data is copied into development, test, or analytics environments without anonymisation, exposing personal data to a wider audience and weaker controls.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Forbid raw production copies in lower environments. 2) Use synthetic data or deterministic masking. 3) Audit datasets in non-prod for PII. 4) Apply equal access controls if real data must be used.",
        frameworkMappings: [FM.iso("A.8.33", "Test information"), FM.gdp("Art. 32", "Security of processing")],
    },
    {
        id: "RSK-CLS-002",
        category: "Information Classification",
        title: "Confidential documents not marked",
        description: "Sensitive documents are circulated without classification labels (e.g. 'Confidential', 'Restricted'), increasing the chance of accidental disclosure.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Configure document templates with default classification labels. 2) Use sensitivity labels in collaboration suites (Microsoft 365 / Google Workspace). 3) Train staff to apply correct labels.",
        frameworkMappings: [FM.iso("A.5.13", "Labelling of information"), FM.soc("CC6.1", "Logical access controls")],
    },
    {
        id: "RSK-CLS-003",
        category: "Information Classification",
        title: "DLP not enforced on outbound channels",
        description: "Sensitive data can leave the organisation via email, cloud upload, or removable media without detection or block.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Deploy DLP rules for the top exfil channels (email, web, USB). 2) Tune for false positives over 60 days before enforcing block. 3) Monitor DLP events as a KPI.",
        frameworkMappings: [FM.iso("A.8.12", "Data leakage prevention"), FM.soc("CC6.7", "Data transmission")],
    },

    // ─── Legal & Compliance (4) ───────────────────────────────────────────
    {
        id: "RSK-LEG-001",
        category: "Legal & Compliance",
        title: "Non-compliance with applicable laws and regulations",
        description: "The organisation is unaware of, or has not implemented, the requirements of laws applicable to its operations (IT Act, DPDP, RBI, HIPAA, GDPR), risking fines and reputational damage.",
        defaultLikelihood: 4, defaultImpact: 5,
        recommendation: "1) Maintain a legal-and-regulatory register. 2) Map each obligation to an internal control owner. 3) Re-assess on legal changes. 4) Engage external counsel for jurisdictions of operation.",
        frameworkMappings: [FM.iso("A.5.31", "Legal, statutory, regulatory and contractual requirements"), FM.gdp("Art. 24", "Responsibility of controller"), FM.dpd("S. 8(1)", "Obligations of data fiduciary")],
    },
    {
        id: "RSK-LEG-002",
        category: "Legal & Compliance",
        title: "No DPO/Privacy lead designated",
        description: "Privacy obligations under GDPR/DPDP are not owned by a designated person, causing missed deadlines and uncoordinated regulator interactions.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Appoint a DPO or equivalent privacy lead. 2) Publish their contact for data subjects and regulators. 3) Provide a direct reporting line to leadership.",
        frameworkMappings: [FM.gdp("Art. 37", "Designation of the data protection officer"), FM.dpd("S. 10", "Data Protection Officer")],
    },
    {
        id: "RSK-LEG-003",
        category: "Legal & Compliance",
        title: "Cross-border data transfers without safeguards",
        description: "Personal data is transferred across borders without adequacy decisions, SCCs, or equivalent safeguards, breaching data-protection law.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Map all cross-border data flows. 2) Apply Standard Contractual Clauses or local equivalents. 3) Run transfer-impact assessments where required. 4) Document transfer mechanisms in the RoPA.",
        frameworkMappings: [FM.gdp("Ch. V", "Transfers of personal data"), FM.dpd("S. 16", "Transfer of personal data outside India")],
    },
    {
        id: "RSK-LEG-004",
        category: "Legal & Compliance",
        title: "Software licence non-compliance",
        description: "Software is used beyond licensed seats, in unsupported configurations, or with incompatible open-source licences embedded in commercial products.",
        defaultLikelihood: 3, defaultImpact: 3,
        recommendation: "1) Maintain a Software Asset Management inventory. 2) Reconcile licences quarterly. 3) Run open-source licence scans on every release. 4) Track licence-renewal dates.",
        frameworkMappings: [FM.iso("A.5.32", "Intellectual property rights"), FM.soc("CC1.4", "Personnel competence")],
    },

    // ─── Operational Security (3) ─────────────────────────────────────────
    {
        id: "RSK-OPS-001",
        category: "Operational Security",
        title: "Use of end-of-life (EOL) software",
        description: "Operating systems, libraries, or appliances no longer receiving security updates are still in production. Newly disclosed vulnerabilities cannot be patched.",
        defaultLikelihood: 4, defaultImpact: 5,
        recommendation: "1) Inventory all software with vendor support status. 2) Define a hard-stop date 6 months before EOL to plan upgrades. 3) Where upgrade is not possible, isolate and compensate (segmentation, virtual patching). 4) Track EOL exposure as a KPI.",
        frameworkMappings: [FM.iso("A.8.8", "Management of technical vulnerabilities"), FM.soc("CC7.1", "System operations")],
    },
    {
        id: "RSK-OPS-002",
        category: "Operational Security",
        title: "Inadequate patch management",
        description: "Critical and high vulnerabilities are not remediated within defined SLAs because there is no inventory, no scanning, or no ownership.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Run authenticated vulnerability scans weekly. 2) Define remediation SLAs by severity (e.g. Critical: 7 days, High: 30 days). 3) Auto-patch where safe. 4) Report SLA compliance monthly.",
        frameworkMappings: [FM.iso("A.8.8", "Management of technical vulnerabilities"), FM.soc("CC7.1", "System operations")],
    },
    {
        id: "RSK-OPS-003",
        category: "Operational Security",
        title: "Insufficient endpoint protection",
        description: "Workstations and servers run without modern EDR, are not enrolled in MDM, or have inconsistent baseline hardening.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Deploy EDR to 100% of corporate endpoints. 2) Enforce MDM baselines (encryption, screen-lock, OS update). 3) Quarantine non-compliant devices from corporate apps via conditional access.",
        frameworkMappings: [FM.iso("A.8.7", "Protection against malware"), FM.soc("CC6.6", "Endpoint security")],
    },

    // ─── Physical Security (5) ────────────────────────────────────────────
    {
        id: "RSK-PHY-001",
        category: "Physical Security",
        title: "Loss or theft of unencrypted physical devices",
        description: "Laptops, hard drives, and USB drives without disk encryption are lost or stolen, exposing data on the device.",
        defaultLikelihood: 4, defaultImpact: 5,
        recommendation: "1) Enforce full-disk encryption on all corporate devices via MDM. 2) Restrict and audit USB use, or block by default. 3) Enable remote wipe on mobile devices. 4) Train employees on reporting loss.",
        frameworkMappings: [FM.iso("A.7.10", "Storage media"), FM.soc("CC6.7", "Data transmission"), FM.hip("164.310(d)(2)(iii)", "Accountability")],
    },
    {
        id: "RSK-PHY-002",
        category: "Physical Security",
        title: "Unauthorised physical access to office or data centre",
        description: "Tail-gating, unbadged visitors, or unmonitored entry points let outsiders into spaces with sensitive data.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Require badge access on all entry points; log all entries. 2) Implement a visitor sign-in process with escort. 3) Install CCTV at entry points and retain for 90 days. 4) Periodically test physical access controls.",
        frameworkMappings: [FM.iso("A.7.2", "Physical entry"), FM.soc("CC6.4", "Physical access"), FM.hip("164.310(a)(1)", "Facility access controls")],
    },
    {
        id: "RSK-PHY-003",
        category: "Physical Security",
        title: "Server rooms accessible to non-authorised staff",
        description: "Network and server rooms are accessible to employees who do not need entry, increasing the chance of accidental damage or insider mischief.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Restrict server-room access via badge to a named list. 2) Review the access list quarterly. 3) Log entries; review unusual access weekly.",
        frameworkMappings: [FM.iso("A.7.4", "Physical security monitoring"), FM.soc("CC6.4", "Physical access")],
    },
    {
        id: "RSK-PHY-004",
        category: "Physical Security",
        title: "Inadequate environmental controls",
        description: "Server and network rooms lack adequate cooling, fire suppression, or power redundancy, risking outage from a foreseeable environmental event.",
        defaultLikelihood: 2, defaultImpact: 4,
        recommendation: "1) Install temperature/humidity monitoring with alerts. 2) Equip rooms with fire suppression suitable for electronics. 3) Provision UPS and generator capacity matched to critical load. 4) Test at least annually.",
        frameworkMappings: [FM.iso("A.7.5", "Protecting against physical and environmental threats"), FM.soc("A1.2", "Recovery planning")],
    },
    {
        id: "RSK-PHY-005",
        category: "Physical Security",
        title: "Clear-desk / clear-screen not enforced",
        description: "Sensitive documents are left on desks and screens unlocked when employees step away, especially in shared or open offices.",
        defaultLikelihood: 4, defaultImpact: 2,
        recommendation: "1) Publish and communicate a clear-desk / clear-screen policy. 2) Enforce screen auto-lock via MDM (≤ 5 minutes). 3) Provide locked storage for paper files. 4) Conduct periodic walkarounds.",
        frameworkMappings: [FM.iso("A.7.7", "Clear desk and clear screen"), FM.soc("CC6.4", "Physical access")],
    },

    // ─── Privacy (6) ──────────────────────────────────────────────────────
    {
        id: "RSK-PRV-001",
        category: "Privacy",
        title: "Failure to obtain valid consent before collecting personal data",
        description: "Personal data is collected without specific, informed, freely given consent — or under bundled-consent banners that do not satisfy GDPR/DPDP.",
        defaultLikelihood: 4, defaultImpact: 5,
        recommendation: "1) Audit data-collection points for consent quality. 2) Implement granular, opt-in consent flows. 3) Log consent records with timestamp, purpose, and version. 4) Provide easy withdrawal.",
        frameworkMappings: [FM.gdp("Art. 7", "Conditions for consent"), FM.dpd("S. 6", "Consent")],
    },
    {
        id: "RSK-PRV-002",
        category: "Privacy",
        title: "Data subject rights requests not handled within deadline",
        description: "Access, deletion, or correction requests are missed or answered late, violating GDPR (1 month) or DPDP timelines and prompting regulator complaints.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Stand up a DSR intake channel. 2) Document the workflow with role-based SLAs. 3) Track requests in a register with deadline alerts. 4) Train customer-support and HR.",
        frameworkMappings: [FM.gdp("Art. 12-22", "Rights of the data subject"), FM.dpd("S. 11-13", "Rights of data principal")],
    },
    {
        id: "RSK-PRV-003",
        category: "Privacy",
        title: "Privacy notice missing or inaccurate",
        description: "The public privacy notice does not match actual processing — purposes, retention, recipients — leading to a breach of transparency obligations.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Reconcile the privacy notice against the RoPA. 2) Update on every new processing activity. 3) Version-control the notice with effective date.",
        frameworkMappings: [FM.gdp("Art. 13-14", "Information to be provided"), FM.dpd("S. 5", "Notice")],
    },
    {
        id: "RSK-PRV-004",
        category: "Privacy",
        title: "No DPIA performed on high-risk processing",
        description: "New high-risk processing — biometric, large-scale, profiling — is launched without a Data Protection Impact Assessment, violating GDPR Art. 35.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Define DPIA-trigger criteria. 2) Block release of qualifying features until a DPIA is signed off. 3) Maintain DPIA register. 4) Consult the regulator where required.",
        frameworkMappings: [FM.gdp("Art. 35", "Data protection impact assessment")],
    },
    {
        id: "RSK-PRV-005",
        category: "Privacy",
        title: "Children's data processed without verification",
        description: "Services collect personal data from minors without parental consent or age verification, violating GDPR Art. 8 / DPDP S. 9.",
        defaultLikelihood: 3, defaultImpact: 4,
        recommendation: "1) Identify whether the service is likely to be used by minors. 2) Apply age-verification controls where it is. 3) Obtain verifiable parental consent. 4) Apply additional safeguards (no profiling, ad limits).",
        frameworkMappings: [FM.gdp("Art. 8", "Conditions for child consent"), FM.dpd("S. 9", "Processing of children's data")],
    },
    {
        id: "RSK-PRV-006",
        category: "Privacy",
        title: "Marketing communications without lawful basis",
        description: "Marketing emails or SMS are sent without a documented lawful basis (consent or legitimate interest with opt-out), generating complaints and regulator scrutiny.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Audit marketing lists for lawful basis. 2) Suppress contacts without basis. 3) Honour unsubscribe within 24 hours. 4) Maintain records of basis and opt-in events.",
        frameworkMappings: [FM.gdp("Art. 6", "Lawfulness of processing"), FM.dpd("S. 7", "Notice for further processing")],
    },

    // ─── Risk Management (2) ──────────────────────────────────────────────
    {
        id: "RSK-RM-001",
        category: "Risk Management",
        title: "Risk treatment plans assigned but never executed",
        description: "Risks are acknowledged and assigned for treatment, but the controls are never implemented — so the risk persists and the audit trail shows a gap between intent and reality.",
        defaultLikelihood: 5, defaultImpact: 4,
        recommendation: "1) Track every risk treatment as an action item with an owner and due date. 2) Review overdue treatments at the security committee. 3) Escalate to leadership when treatments slip more than 30 days.",
        frameworkMappings: [FM.iso("Cl. 6.1.3", "Information security risk treatment"), FM.iso("Cl. 8.3", "Information security risk treatment")],
    },
    {
        id: "RSK-RM-002",
        category: "Risk Management",
        title: "No periodic risk review",
        description: "The risk register is built once and then forgotten. New risks are not added, scores age, and treatments are not closed.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Schedule quarterly risk reviews with the security committee. 2) Re-score open risks. 3) Close completed treatments. 4) Add new risks identified in the period.",
        frameworkMappings: [FM.iso("Cl. 8.2", "Information security risk assessment"), FM.soc("CC3.2", "Risk identification")],
    },

    // ─── Vendor Management (6) ────────────────────────────────────────────
    {
        id: "RSK-VEN-001",
        category: "Vendor Management",
        title: "No vendor inventory or tiering",
        description: "There is no central list of third-party vendors, what data they process, or how critical they are. New vendors are onboarded ad-hoc by individual teams.",
        defaultLikelihood: 5, defaultImpact: 4,
        recommendation: "1) Build a vendor inventory with data-access category and criticality tier. 2) Define onboarding gates per tier. 3) Reconcile against AP records quarterly.",
        frameworkMappings: [FM.iso("A.5.19", "Information security in supplier relationships"), FM.soc("CC9.2", "Vendor management")],
    },
    {
        id: "RSK-VEN-002",
        category: "Vendor Management",
        title: "No Data Processing Agreement (DPA) with vendors",
        description: "Vendors process personal data on behalf of the organisation without a signed DPA, breaching GDPR Art. 28 and DPDP equivalent obligations.",
        defaultLikelihood: 5, defaultImpact: 4,
        recommendation: "1) Identify all vendors who process personal data. 2) Sign DPAs with each. 3) Block onboarding of new processors without an executed DPA. 4) Re-sign on renewal.",
        frameworkMappings: [FM.iso("A.5.19", "Information security in supplier relationships"), FM.gdp("Art. 28", "Processor obligations"), FM.dpd("S. 8(2)", "Use of data processors")],
    },
    {
        id: "RSK-VEN-003",
        category: "Vendor Management",
        title: "No vendor security assessment before onboarding",
        description: "Vendors are engaged without due-diligence security review, leading to weakly secured suppliers becoming a path into the organisation.",
        defaultLikelihood: 4, defaultImpact: 4,
        recommendation: "1) Define a security questionnaire scaled to vendor tier. 2) Block contract signature until review is approved. 3) Require evidence (SOC 2 / ISO 27001) for tier-1 vendors. 4) Re-assess annually.",
        frameworkMappings: [FM.iso("A.5.20", "Addressing information security within supplier agreements"), FM.soc("CC9.2", "Vendor management")],
    },
    {
        id: "RSK-VEN-004",
        category: "Vendor Management",
        title: "No SLA or right-to-audit clause in vendor contracts",
        description: "Contracts lack security SLAs (uptime, breach notification, support) and audit-right clauses, leaving the organisation unable to verify or enforce vendor obligations.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Maintain a standard contract addendum covering security, breach notification, audit rights. 2) Require legal review on tier-1 contracts. 3) Track which contracts include the addendum.",
        frameworkMappings: [FM.iso("A.5.20", "Addressing information security within supplier agreements"), FM.soc("CC9.2", "Vendor management")],
    },
    {
        id: "RSK-VEN-005",
        category: "Vendor Management",
        title: "Critical vendor without business-continuity plan",
        description: "A vendor whose outage would halt core business operations has no documented BCP/DR posture. A single vendor failure cascades to the organisation.",
        defaultLikelihood: 3, defaultImpact: 5,
        recommendation: "1) Identify single-vendor dependencies. 2) Request and review the vendor's BCP/DR plan. 3) Define a fall-back vendor or workaround. 4) Track vendor status during incidents.",
        frameworkMappings: [FM.iso("A.5.30", "ICT readiness for business continuity"), FM.soc("A1.2", "Recovery planning")],
    },
    {
        id: "RSK-VEN-006",
        category: "Vendor Management",
        title: "Vendor offboarding leaves data behind",
        description: "When a vendor relationship ends, data is not returned or deleted, accounts remain active, and integrations stay open.",
        defaultLikelihood: 4, defaultImpact: 3,
        recommendation: "1) Define a vendor offboarding checklist (data return/destruction certificate, account removal, key revocation). 2) Track every termination through the checklist. 3) Audit terminated-vendor accounts quarterly.",
        frameworkMappings: [FM.iso("A.5.22", "Monitoring, review and change management of supplier services"), FM.gdp("Art. 28", "Processor obligations")],
    },
];

// Sanity check at module load — sum of CATEGORIES.count.
const EXPECTED_TOTAL = CATEGORIES.reduce((sum, c) => sum + c.count, 0);
if (process.env.NODE_ENV !== "production" && RISK_LIBRARY.length !== EXPECTED_TOTAL) {
    console.warn(`[risk-library] expected ${EXPECTED_TOTAL} risks, got ${RISK_LIBRARY.length}`);
}

// ---------------------------------------------------------------------------
// Convenience selectors
// ---------------------------------------------------------------------------

export function getLibraryRiskById(id: string): LibraryRisk | undefined {
    return RISK_LIBRARY.find(r => r.id === id);
}

export function getLibraryRisksByCategory(category: string): LibraryRisk[] {
    return RISK_LIBRARY.filter(r => r.category === category);
}

export function libraryRisksGroupedByCategory(): Record<string, LibraryRisk[]> {
    return RISK_LIBRARY.reduce<Record<string, LibraryRisk[]>>((acc, r) => {
        (acc[r.category] ??= []).push(r);
        return acc;
    }, {});
}
