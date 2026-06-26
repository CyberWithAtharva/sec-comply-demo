export interface PolicyTemplate {
    title: string;
    category: string;
    /** Markdown content for the policy body */
    content: string;
    /** control_id text values (e.g. "CC6.1") this policy satisfies */
    controlIds: string[];
    /** Framework names this template applies to */
    applicableFrameworks: string[];
    /** How many months until the policy should be reviewed */
    nextReviewMonths: number;
}

export const POLICY_TEMPLATES: PolicyTemplate[] = [
    {
        title: "Information Security Policy",
        category: "Security",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "CC1.1", "CC1.2", "CC1.3", "CC1.4", "CC1.5",
            // ISO 27001
            "A.5.1", "A.5.2", "A.5.4",
            // NIST CSF
            "GV.PO-01", "GV.PO-02",
        ],
        content: `## Purpose

This Information Security Policy establishes the organization's commitment to protecting the confidentiality, integrity, and availability of information assets. It defines the overall governance framework for information security across all systems, personnel, and operations.

## Scope

This policy applies to all employees, contractors, consultants, temporary staff, and other personnel who access company information or systems. It covers all information assets regardless of format (digital, physical) or location (on-premises, cloud, remote).

## Policy Statements

### Management Commitment
Senior management is committed to information security and will:
- Allocate adequate resources to establish and maintain an effective ISMS
- Set security objectives aligned with organizational strategy
- Ensure continuous improvement of security practices

### Security Objectives
The organization shall maintain security objectives to:
1. Protect confidential customer and business data from unauthorized access
2. Ensure availability of critical systems to meet business requirements
3. Maintain integrity of data and systems throughout their lifecycle
4. Comply with applicable legal, regulatory, and contractual requirements

### Roles and Responsibilities
- **CEO / Executive Team**: Ultimate accountability for information security
- **Security Officer / CISO**: Day-to-day management of the security program
- **IT Team**: Implementation and maintenance of security controls
- **All Employees**: Compliance with this policy and related procedures

### Risk Management
The organization shall conduct annual risk assessments to identify, analyze, and treat information security risks. Risk treatment decisions shall be documented and reviewed by management.

### Compliance
Violations of this policy may result in disciplinary action up to and including termination of employment or contract. Suspected violations should be reported to the Security Officer.

## Review

This policy shall be reviewed annually or after any significant security incident or organizational change.`,
    },

    {
        title: "Access Control Policy",
        category: "Access",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "CC6.1", "CC6.2", "CC6.3", "CC6.4", "CC6.7",
            // ISO 27001
            "A.5.15", "A.5.16", "A.5.17", "A.5.18",
            // NIST CSF
            "PR.AA-01", "PR.AA-02", "PR.AA-03", "PR.AA-05",
        ],
        content: `## Purpose

This Access Control Policy defines the rules and requirements for granting, managing, and revoking access to organizational systems and data. It ensures that access is granted on a need-to-know and least-privilege basis.

## Scope

All information systems, applications, databases, and network infrastructure owned or managed by the organization.

## Policy Statements

### Access Provisioning
- Access requests must be formally submitted and approved by the relevant system owner and employee's manager
- Access shall be provisioned using the principle of least privilege — users receive only the minimum access required for their job function
- All access shall be provisioned within 5 business days of approval

### Multi-Factor Authentication (MFA)
- MFA is required for all accounts accessing production systems, cloud consoles, and privileged administrative interfaces
- MFA is required for all remote access (VPN, SSH, RDP)
- Exceptions must be formally approved by the Security Officer

### Password Requirements
- Minimum length: 12 characters
- Must include uppercase, lowercase, numbers, and special characters
- Must not be reused from the last 10 passwords
- Must be changed at least every 90 days for privileged accounts
- Passwords must not be shared between individuals or written down in unsecured locations

### Privileged Access
- Privileged accounts (admin, root) must be separate from standard user accounts
- Privileged access must not be used for routine day-to-day activities
- All privileged actions must be logged and retained for a minimum of 90 days

### Access Reviews
- Access rights for all users shall be reviewed quarterly
- Any access that is no longer required must be revoked within 5 business days
- Access for terminated employees must be revoked on the day of termination

### Remote Access
- Remote access is permitted only via approved, company-managed VPN or zero-trust solutions
- Remote sessions must time out after 30 minutes of inactivity

## Review

This policy shall be reviewed annually or whenever significant changes to the access model are made.`,
    },

    {
        title: "Change Management Policy",
        category: "Operations",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "CC8.1", "CC5.1", "CC5.2", "CC5.3",
            // ISO 27001
            "A.8.32",
            // NIST CSF
            "PR.PS-03",
        ],
        content: `## Purpose

This Change Management Policy ensures that all changes to IT systems, infrastructure, and applications are planned, tested, approved, and implemented in a controlled manner to minimize risk to business operations.

## Scope

All changes to production systems, infrastructure, applications, databases, network configurations, and security controls.

## Change Categories

### Standard Changes
Pre-approved, low-risk changes with well-established procedures (e.g., routine patches, configuration updates from an approved baseline). These follow a simplified approval process.

### Normal Changes
Changes that require full review and approval before implementation. Must be submitted at least 3 business days before the planned implementation window.

### Emergency Changes
Urgent changes required to restore service or address a critical security vulnerability. These may bypass standard timelines but require retrospective review within 5 business days.

## Change Process

### 1. Request
All change requests must document:
- Description and business justification
- Systems and users impacted
- Rollback plan
- Risk assessment
- Test results (for normal and emergency changes)

### 2. Review and Approval
- Changes must be approved by the system owner and at least one member of the Change Advisory Board (CAB)
- Security-related changes require Security Officer approval

### 3. Testing
- All changes must be tested in a non-production environment before deployment to production
- Test results must be documented and retained for audit purposes

### 4. Implementation
- Changes must be implemented during approved maintenance windows where possible
- A rollback procedure must be ready to execute if the change fails

### 5. Post-Implementation Review
- Changes must be reviewed within 72 hours of implementation to confirm success
- Any issues discovered must be logged and tracked to resolution

## Review

This policy shall be reviewed annually.`,
    },

    {
        title: "Incident Response Plan",
        category: "Operations",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "CC7.3", "CC7.4", "CC7.5",
            // ISO 27001
            "A.5.24", "A.5.25", "A.5.26",
            // NIST CSF
            "RS.MA-01", "RS.MA-02", "RS.AN-01",
        ],
        content: `## Purpose

This Incident Response Plan (IRP) defines the procedures for detecting, responding to, and recovering from information security incidents. The goal is to minimize the impact of incidents on business operations, customers, and data.

## Incident Severity Classification

| Severity | Definition | Response Time |
|----------|-----------|---------------|
| Critical | Breach of sensitive data, ransomware, full system compromise | Immediate (< 1 hour) |
| High | Partial system compromise, suspected data exposure, active threat | < 4 hours |
| Medium | Malware infection, unauthorized access attempts, service degradation | < 24 hours |
| Low | Policy violations, isolated security events, informational alerts | < 72 hours |

## Response Phases

### Phase 1: Preparation
- Maintain and test this plan at least annually via tabletop exercises
- Ensure all team members know their roles
- Maintain up-to-date contact lists and escalation paths

### Phase 2: Identification
- Monitor security tools, logs, and alerts for anomalies
- Any employee who suspects an incident must report it immediately to the Security Officer
- Initial triage: determine if the event is a confirmed incident, false positive, or requires further investigation

### Phase 3: Containment
- Isolate affected systems to prevent spread (network isolation, account lockout)
- Preserve evidence: take forensic snapshots before making changes
- Document all actions taken with timestamps

### Phase 4: Eradication
- Identify and remove the root cause (malware, unauthorized accounts, vulnerable software)
- Apply patches or configuration changes to prevent recurrence
- Confirm the threat has been fully eliminated before proceeding

### Phase 5: Recovery
- Restore systems from clean backups or rebuild from scratch
- Validate system integrity before returning to production
- Monitor closely for 48–72 hours post-recovery

### Phase 6: Post-Incident Review
- Conduct a lessons-learned review within 14 days of incident closure
- Document root cause, timeline, impact, and corrective actions
- Update this plan and security controls based on findings

## Notification Requirements
- Executive team must be notified of Critical and High incidents within 1 hour
- Legal and Privacy teams must be consulted if personal data may be affected
- Regulatory notification timelines must be followed (e.g., GDPR: 72 hours)

## Review

This plan shall be reviewed annually and after any significant incident.`,
    },

    {
        title: "Business Continuity and Disaster Recovery Plan",
        category: "Operations",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "A1.1", "A1.2", "A1.3",
            // ISO 27001
            "A.5.29", "A.5.30",
            // NIST CSF
            "RC.RP-01", "RC.RP-02",
        ],
        content: `## Purpose

This Business Continuity and Disaster Recovery (BCDR) Plan ensures the organization can maintain or rapidly restore critical business functions during and after a disruptive event.

## Business Impact Analysis

### Critical Systems and Recovery Objectives

| System | RTO | RPO | Priority |
|--------|-----|-----|----------|
| Production Application | 4 hours | 1 hour | P1 |
| Customer Database | 4 hours | 15 minutes | P1 |
| Authentication Services | 2 hours | 15 minutes | P1 |
| Internal Communications | 8 hours | 4 hours | P2 |
| Development Environment | 48 hours | 24 hours | P3 |

*(RTO = Recovery Time Objective, RPO = Recovery Point Objective)*

## Backup Strategy

- **Database**: Continuous replication with automated snapshots every 15 minutes. Snapshots retained for 30 days.
- **Application**: Immutable deployment artifacts stored in version-controlled repositories
- **Configuration**: Infrastructure-as-Code in version control; daily backups of secrets management system
- **Backup Testing**: Restoration from backups tested quarterly

## Disaster Scenarios and Responses

### Cloud Region Outage
1. Activate failover to secondary region
2. Update DNS to point to secondary endpoint
3. Verify data consistency between regions
4. Notify affected customers if SLA is impacted

### Data Center / On-Premises Failure
1. Activate cloud-based backup environment
2. Restore from most recent clean backup
3. Communicate status to stakeholders

### Ransomware / Destructive Attack
1. Isolate affected systems immediately
2. Engage incident response plan in parallel
3. Restore from offline/immutable backups only
4. Do not pay ransom without legal/executive approval

## Communication Plan
- Internal: Use out-of-band communication channel (personal phones, external email) if primary systems are down
- External: Status page updated within 30 minutes of confirming a major incident
- Executive briefings: Hourly during active recovery for P1 incidents

## Testing
- BCDR plan must be tested at least annually via a tabletop exercise or live failover test
- Results must be documented and any gaps remediated within 90 days

## Review

This plan shall be reviewed annually or after any major infrastructure change or disaster event.`,
    },

    {
        title: "Vendor Risk Management Policy",
        category: "Vendor",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "CC9.1", "CC9.2",
            // ISO 27001
            "A.5.19", "A.5.20", "A.5.21", "A.5.22",
            // NIST CSF
            "GV.SC-01", "GV.SC-06",
        ],
        content: `## Purpose

This Vendor Risk Management Policy establishes requirements for assessing, managing, and monitoring the risks associated with third-party vendors and service providers who have access to organizational data or systems.

## Vendor Tiers

| Tier | Definition | Assessment Frequency |
|------|-----------|---------------------|
| Tier 1 (Critical) | Access to sensitive/personal data, or critical infrastructure dependency | Annual + event-driven |
| Tier 2 (High) | Access to internal systems but not sensitive data | Annual |
| Tier 3 (Low) | No access to data or systems; limited business impact | Biennial |

## Onboarding Requirements

Before engaging a new vendor:
1. Complete vendor risk assessment questionnaire
2. Review vendor's security certifications (SOC 2, ISO 27001, etc.)
3. Obtain signed Data Processing Agreement (DPA) if vendor will process personal data
4. Include security requirements in the contract (minimum security standards, incident notification, audit rights)
5. Obtain Security Officer approval for Tier 1 vendors

## Ongoing Monitoring

- Tier 1 vendors: Annual reassessment + continuous monitoring via security ratings tools
- Tier 2 vendors: Annual reassessment
- Monitor vendor security news and breach notifications
- Review vendor contracts at renewal for updated security requirements

## Vendor Termination
- Upon vendor offboarding, revoke all access within 24 hours
- Confirm data deletion or return per contractual terms
- Document termination in the vendor register

## Sub-processors
- Vendors must disclose all sub-processors with access to organizational data
- Changes to sub-processors require 30 days advance notice
- Organization maintains a public sub-processor list in the Trust Center

## Review

This policy shall be reviewed annually.`,
    },

    {
        title: "Data Classification and Retention Policy",
        category: "Data",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "C1.1", "C1.2", "P4.1",
            // ISO 27001
            "A.5.9", "A.5.10", "A.5.11", "A.5.12", "A.5.13",
        ],
        content: `## Purpose

This policy establishes a framework for classifying organizational data based on its sensitivity and value, and defines retention periods and disposal procedures to ensure data is protected throughout its lifecycle.

## Data Classification Levels

### Public
Information approved for public distribution (e.g., marketing materials, press releases).
- No special handling required
- May be shared externally without restriction

### Internal
Information intended for internal use only (e.g., internal procedures, employee directories).
- Should not be shared externally without business justification
- Must be stored on company-approved systems

### Confidential
Sensitive business information where unauthorized disclosure could cause significant harm (e.g., financial data, business strategies, non-public contracts).
- Must be encrypted in transit and at rest
- Access restricted to authorized personnel only
- Must not be stored on personal devices without encryption

### Restricted
Highly sensitive information subject to legal or regulatory protection (e.g., personal data, payment card data, health information, credentials).
- Requires explicit authorization to access
- Must be encrypted at all times
- Access must be logged
- Governed by specific compliance requirements (GDPR, PCI DSS, HIPAA)

## Data Retention Schedule

| Data Type | Classification | Retention Period |
|-----------|---------------|-----------------|
| Customer personal data | Restricted | Duration of relationship + 2 years |
| Financial records | Confidential | 7 years |
| Security logs | Internal | 1 year |
| Audit logs | Confidential | 3 years |
| Employee records | Confidential | 7 years post-employment |
| Contracts | Confidential | 7 years post-expiry |
| Marketing materials | Public | No minimum |

## Data Disposal

- Digital data: Overwrite using NIST 800-88 compliant method or cryptographic erasure
- Physical media: Cross-cut shredding or secure destruction service with certificate of destruction
- Cloud data: Confirm deletion via provider's certified deletion process
- Disposal must be documented in a destruction log

## Review

This policy shall be reviewed annually or whenever significant changes to data handling occur.`,
    },

    {
        title: "Risk Management Policy",
        category: "Risk",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2
            "CC3.1", "CC3.2", "CC3.3", "CC3.4", "CC9.1",
            // ISO 27001
            "A.6.1", "A.6.2", "A.6.3",
            // NIST CSF
            "GV.RM-01", "GV.RM-02", "GV.RM-06",
        ],
        content: `## Purpose

This Risk Management Policy establishes the framework for identifying, assessing, treating, and monitoring information security risks across the organization. Effective risk management enables informed decision-making and protects the organization's assets, reputation, and ability to operate.

## Risk Assessment Process

### Identification
Risks are identified through:
- Annual structured risk workshops with stakeholders
- Continuous monitoring of threat intelligence sources
- Results of penetration testing and vulnerability scans
- Security incidents and near-misses
- Changes to systems, processes, or business environment

### Analysis
Each identified risk is analyzed using:
- **Likelihood**: Probability of occurrence (1 = Rare to 5 = Almost Certain)
- **Impact**: Consequence if realized (1 = Insignificant to 5 = Catastrophic)
- **Risk Score**: Likelihood × Impact (1–25)

### Risk Severity Thresholds

| Score | Severity | Required Action |
|-------|----------|-----------------|
| 20–25 | Critical | Immediate treatment required; executive escalation |
| 12–19 | High | Treatment plan within 30 days |
| 6–11 | Medium | Treatment plan within 90 days |
| 1–5 | Low | Monitor and review annually |

### Treatment Options
- **Mitigate**: Implement controls to reduce likelihood or impact
- **Transfer**: Insurance, contracts, or outsourcing
- **Accept**: Formally document and accept residual risk (requires management sign-off)
- **Avoid**: Cease or modify the activity that creates the risk

## Risk Register
All risks with a score of 6 or above must be entered into the Risk Register with:
- Risk owner
- Treatment option and controls
- Target risk score after treatment
- Due date for treatment actions
- Status (Identified → Assessed → Mitigating → Accepted → Closed)

## Review Cadence
- Risk Register reviewed monthly by Security Officer
- Full risk assessment conducted annually
- Significant changes trigger ad-hoc risk assessments

## Review

This policy shall be reviewed annually.`,
    },

    {
        title: "Vulnerability Management Policy",
        category: "Security",
        applicableFrameworks: ["SOC 2 Type II", "ISO 27001", "NIST CSF 2.0"],
        nextReviewMonths: 6,
        controlIds: [
            // SOC 2
            "CC7.1", "CC7.2",
            // ISO 27001
            "A.8.8",
            // NIST CSF
            "ID.RA-01", "DE.CM-08", "PR.PS-02",
        ],
        content: `## Purpose

This Vulnerability Management Policy defines requirements for discovering, prioritizing, and remediating security vulnerabilities in organizational systems and software to reduce exposure to cyberattacks.

## Scanning Requirements

| Asset Type | Scan Frequency | Tool |
|-----------|---------------|------|
| External attack surface | Weekly | Automated scanner |
| Internal infrastructure | Monthly | Authenticated scanner |
| Web applications | At release + quarterly | DAST/SAST |
| Container images | On every build | Image scanning in CI/CD |
| Cloud configuration | Continuous | CSPM tool (SecComply) |
| Third-party dependencies | On every build | SCA / Dependabot |

## Remediation Timelines

| CVSS Score | Severity | Remediation SLA |
|-----------|----------|-----------------|
| 9.0–10.0 | Critical | 7 days |
| 7.0–8.9 | High | 30 days |
| 4.0–6.9 | Medium | 90 days |
| 0.1–3.9 | Low | Next scheduled maintenance cycle |

## Patch Management
- All operating systems and software must be kept up-to-date with security patches
- Critical patches must be applied within 7 days of release
- Emergency patching procedures must not require Change Advisory Board pre-approval; retrospective review required within 5 days

## Exceptions
- Exceptions to remediation timelines must be formally documented with:
  - Business justification
  - Compensating controls in place
  - Risk owner sign-off
  - Expiry date (maximum 90-day exception period)

## Penetration Testing
- External penetration test must be conducted at least annually by a qualified third party
- Findings must be tracked in the VAPT Tracker and remediated per the SLAs above

## Review

This policy shall be reviewed every 6 months.`,
    },

    {
        title: "Privacy and Data Protection Policy",
        category: "Privacy",
        applicableFrameworks: ["SOC 2 Type II"],
        nextReviewMonths: 12,
        controlIds: [
            // SOC 2 Privacy criteria
            "P1.1", "P2.1", "P3.1", "P4.1", "P5.1", "P6.1", "P7.1", "P8.1",
        ],
        content: `## Purpose

This Privacy and Data Protection Policy describes how the organization collects, uses, retains, and protects personal information. It reflects our commitment to privacy as a fundamental right and to compliance with applicable data protection regulations.

## Data Subjects and Personal Data

We may process personal information about:
- Customers and prospective customers
- Employees and contractors
- Website visitors

Types of personal data we collect include: name, email address, IP address, usage data, and any information voluntarily provided.

## Legal Basis for Processing

We process personal data only when we have a lawful basis, including:
- **Consent**: Where the data subject has provided explicit, informed consent
- **Contract**: Where processing is necessary to perform a contract with the data subject
- **Legal obligation**: Where required by applicable law
- **Legitimate interests**: Where our interests are balanced against the rights of the data subject

## Data Subject Rights

Data subjects have the right to:
- **Access**: Request a copy of their personal data
- **Rectification**: Correct inaccurate data
- **Erasure**: Request deletion of their data ("right to be forgotten")
- **Portability**: Receive their data in a machine-readable format
- **Objection**: Object to certain types of processing
- **Restriction**: Limit how we process their data

Requests must be fulfilled within 30 days. Contact the Privacy Officer to submit a request.

## Data Minimization
We collect only the personal data that is necessary for the specified purpose. Data collected for one purpose will not be repurposed without new consent or a legal basis.

## Data Retention
Personal data is retained only as long as necessary for the original purpose or as required by law. See the Data Classification and Retention Policy for specific retention periods.

## International Transfers
Personal data shall not be transferred to countries outside the EEA or UK unless:
- The destination country has an adequacy decision, or
- Appropriate safeguards are in place (e.g., Standard Contractual Clauses)

## Breach Notification
In the event of a personal data breach:
- The Privacy Officer must be notified within 1 hour of discovery
- If required by regulation (e.g., GDPR), supervisory authorities will be notified within 72 hours
- Affected data subjects will be notified without undue delay if high risk

## Review

This policy shall be reviewed annually or when significant changes to data processing occur.`,
    },

    // ========================================================
    // ISO 9001:2015 — Quality Management System
    // 1 Quality Policy + the practical SOP set for a manufacturer.
    // controlIds are ISO 9001 clause numbers seeded in migration 013;
    // the generate route links each SOP to its clause via policy_controls.
    // ========================================================
    {
        title: "Quality Policy",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["5.1", "5.1.2", "5.2", "5.3"],
        content: `## Purpose

This Quality Policy states top management's commitment to a Quality Management System (QMS) that consistently delivers products meeting customer, statutory and regulatory requirements, and to the continual improvement of that system. It satisfies ISO 9001:2015 Clause 5.2.

## Scope

This policy applies to all sites, processes, employees and contractors operating within the scope of the QMS as defined in the Scope Statement (Clause 4.3).

## Policy Statements

### Commitment
Top management is committed to:
- Meeting applicable customer, statutory and regulatory requirements
- Establishing and reviewing measurable quality objectives (Clause 6.2)
- Providing the resources needed for an effective QMS
- Continually improving the suitability, adequacy and effectiveness of the QMS

### Customer Focus
The organization shall determine and meet customer requirements, address risks and opportunities that can affect conformity, and maintain a focus on enhancing customer satisfaction.

### Roles and Authorities
Top management appoints a Management Representative / QMS Coordinator accountable for QMS performance and for reporting on its operation. Process owners are responsible for the processes they own and for the records that demonstrate conformity.

### Communication
This policy shall be communicated, understood and applied within the organization, made available to interested parties as appropriate, and acknowledged by personnel.

## Review

This policy shall be reviewed at management review (Clause 9.3) and at least annually for continuing suitability.`,
    },
    {
        title: "Control of Documented Information (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["7.5"],
        content: `## Purpose
Define how documented information is created, approved, distributed, version-controlled and retained, satisfying ISO 9001:2015 Clause 7.5.

## Scope
All QMS documents (policies, manuals, SOPs, work instructions, forms) and all records ("retain" items) regardless of media.

## Procedure
### Documents ("maintain")
- New or changed documents are drafted by the process owner and approved before issue.
- Each document carries a unique code, version number, owner and approval date.
- The current approved version is the only one available for use; superseded versions are withdrawn or clearly marked.

### Records ("retain")
- Records provide evidence of conformity and shall be legible, identifiable and retrievable.
- Retention periods are defined per record type; records are protected from loss or unauthorized alteration.

### External documents
Documents of external origin necessary for the QMS (standards, customer drawings) are identified and their distribution controlled.

## Records
Document master list; approval records; obsolete-document log.

## Review
Reviewed annually.`,
    },
    {
        title: "Internal Audit (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["9.2"],
        content: `## Purpose
Define how internal audits are planned and conducted to confirm the QMS conforms to ISO 9001:2015 and is effectively implemented (Clause 9.2).

## Procedure
- An annual audit programme covers all QMS processes, weighted by importance and prior results.
- Auditors are competent and independent of the area audited.
- Each audit records findings per clause/process: conformities, nonconformities (major/minor) and opportunities for improvement (OFI).
- Nonconformities feed the Corrective Action process (Clause 10.2).
- Results are an input to management review (Clause 9.3).

## Records
Audit programme; audit plans; audit reports; nonconformity records.

## Review
Reviewed annually.`,
    },
    {
        title: "Management Review (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["9.3"],
        content: `## Purpose
Define how top management reviews the QMS at planned intervals for continuing suitability, adequacy, effectiveness and alignment with strategy (Clause 9.3).

## Inputs (prescribed by the standard)
- Status of actions from previous reviews
- Changes in external/internal issues relevant to the QMS
- Performance and effectiveness data: customer satisfaction, quality objectives (KPIs), process performance and product conformity, nonconformities and corrective actions, monitoring results, audit results, external provider performance
- Adequacy of resources; effectiveness of actions on risks and opportunities; opportunities for improvement

## Outputs
Decisions and actions on improvement opportunities, QMS changes, and resource needs.

## Records
Management review minutes with decisions, actions, owners and due dates.

## Review
Held at least annually; this SOP reviewed annually.`,
    },
    {
        title: "Control of Nonconforming Output (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["8.7"],
        content: `## Purpose
Ensure outputs that do not conform to requirements are identified and controlled to prevent unintended use or delivery (Clause 8.7).

## Procedure
- Nonconforming material/product is identified, segregated and recorded on a Nonconformance Report (NCR).
- Disposition options: correction (rework), segregation/containment, return to supplier, concession (acceptance under authorization), or scrap.
- Where required, the customer is informed and concession obtained.
- After correction, conformity is re-verified.
- NCRs that indicate a systemic cause are escalated to Corrective Action (Clause 10.2).

## Records
NCRs with description, disposition, authorization and re-verification.

## Review
Reviewed annually.`,
    },
    {
        title: "Corrective Action (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["10.1", "10.2", "10.3"],
        content: `## Purpose
Define the corrective-action (CAPA) loop: react to nonconformity, eliminate the cause, and prevent recurrence (Clauses 10.1–10.3).

## Procedure
1. **React** — control and correct the nonconformity; deal with consequences.
2. **Evaluate cause** — perform root-cause analysis (e.g. 5-Why, fishbone); determine whether similar nonconformities exist or could occur.
3. **Act** — implement corrective action proportionate to the effects.
4. **Verify effectiveness** — confirm the action worked; update risks and the QMS if needed.

## Sources
Internal/external audit findings, NCRs, customer complaints, KPI breaches.

## Records
CAPA records with root cause, actions, owner, due date and effectiveness verification.

## Review
Reviewed annually; continual improvement is tracked across management reviews.`,
    },
    {
        title: "Risk & Opportunity Management (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["6.1", "6.2", "6.3"],
        content: `## Purpose
Define how risks and opportunities affecting the QMS are determined, addressed and integrated into processes, and how quality objectives and changes are planned (Clauses 6.1–6.3).

## Procedure
- Determine risks and opportunities arising from context (4.1) and interested parties (4.2).
- Assess and plan proportionate actions; integrate them into QMS processes and evaluate their effectiveness.
- Set measurable **quality objectives** at relevant functions (6.2), linked to KPIs in the Monitoring layer, with what/who/when/how-evaluated.
- Plan **changes** to the QMS (6.3) considering purpose, integrity, resources and responsibilities.

## Records
Risk register (maintained in Risk Management); objectives register; change plans.

## Review
Reviewed annually.`,
    },
    {
        title: "Competence & Training (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["7.1.2", "7.2", "7.3"],
        content: `## Purpose
Ensure persons doing work affecting QMS performance are competent and aware (Clauses 7.1.2, 7.2, 7.3).

## Procedure
- Define competence requirements per role (education, training, skills, experience).
- Identify gaps and provide training or take other actions; evaluate effectiveness.
- Ensure personnel are aware of the quality policy, relevant objectives, their contribution and the implications of nonconformity.
- Maintain qualification and training records (links to the People and Awareness Training modules).

## Records
Competence matrix; training records; awareness acknowledgements.

## Review
Reviewed annually.`,
    },
    {
        title: "Purchasing & Supplier Evaluation (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["8.4"],
        content: `## Purpose
Ensure externally provided processes, products and services conform to requirements (Clause 8.4).

## Procedure
- Evaluate and approve suppliers before use against defined criteria; maintain an Approved Supplier List.
- Define the controls applied to external providers based on impact on conformity.
- Communicate purchasing requirements clearly (specs, acceptance criteria, records required).
- Monitor and periodically re-evaluate supplier performance; act on poor performance.

## Records
Approved Supplier List; supplier evaluations and ratings; purchase orders; goods-receipt records.

## Review
Reviewed annually.`,
    },
    {
        title: "Production & Process Control (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["8.1", "8.5.1", "8.5.6"],
        content: `## Purpose
Ensure production is planned and carried out under controlled conditions (Clauses 8.1, 8.5.1, 8.5.6).

## Procedure
- Plan production with defined acceptance criteria and required resources.
- Operate under controlled conditions: approved work instructions, suitable equipment, competent operators, and in-process monitoring.
- Maintain batch/production records capturing process parameters and quantities.
- Review and control changes to production to maintain conformity.

## Records
Production/batch records; in-process check records; change records.

## Review
Reviewed annually.`,
    },
    {
        title: "Identification & Traceability (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["8.5.2"],
        content: `## Purpose
Identify outputs and maintain traceability where required (Clause 8.5.2).

## Procedure
- Identify the status of outputs with respect to monitoring and measurement requirements throughout production.
- Assign and control unique batch/lot identification where traceability is a requirement.
- Maintain records that allow an output to be traced to its inputs, process and inspection results.

## Records
Batch/lot registers; traceability records.

## Review
Reviewed annually.`,
    },
    {
        title: "Calibration of Monitoring & Measuring Resources (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["7.1.5"],
        content: `## Purpose
Ensure monitoring and measuring resources provide valid results (Clause 7.1.5).

## Procedure
- Maintain a register of all instruments requiring calibration/verification, with calibration intervals and due dates.
- Calibrate or verify against standards traceable to national/international standards; label calibration status.
- When an instrument is found out of calibration, assess the validity of previous results and take action.
- Protect instruments from adjustment, damage and deterioration.

## Records
Instrument register; calibration certificates and due-date schedule; out-of-calibration assessments.

## Review
Reviewed annually.`,
    },
    {
        title: "Inspection & Testing (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["8.6"],
        content: `## Purpose
Verify that product requirements are met at incoming, in-process and final stages before release (Clause 8.6).

## Procedure
- **Incoming**: inspect/verify purchased material against specification before use; record accept/reject.
- **In-process**: perform planned checks at defined stages.
- **Final / release**: verify all planned arrangements are complete; product is released only by an authorized person against documented acceptance.
- Retain evidence of conformity and the identity of the releasing authority.

## Records
Inspection results; release records with authorization.

## Review
Reviewed annually.`,
    },
    {
        title: "Order & Customer Requirements Review (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["8.2"],
        content: `## Purpose
Ensure requirements for products and services are understood and can be met before committing to supply (Clause 8.2).

## Procedure
- Determine customer requirements, including delivery and post-delivery, statutory/regulatory requirements, and any organization-determined requirements.
- Review requirements before acceptance; resolve differences between order and quotation.
- Confirm the organization's ability to meet the requirements; record the review and any new requirements.
- Where requirements change, amend relevant documents and inform affected personnel.

## Records
Order-review records; contract amendments.

## Review
Reviewed annually.`,
    },
    {
        title: "Preservation, Storage & Dispatch (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["8.5.3", "8.5.4", "8.5.5"],
        content: `## Purpose
Preserve outputs and manage customer property and post-delivery activities (Clauses 8.5.3–8.5.5).

## Procedure
- Preserve product during processing, storage and delivery to maintain conformity (handling, packaging, identification, environmental protection).
- Exercise care with property belonging to customers or external providers; report loss/damage.
- Control storage to prevent deterioration; apply stock rotation where relevant.
- Meet post-delivery obligations (warranty, servicing) as required.
- Control dispatch so the correct, conforming product is delivered on time.

## Records
Storage/preservation records; customer-property records; dispatch/delivery records.

## Review
Reviewed annually.`,
    },
    {
        title: "Customer Complaints & Satisfaction (SOP)",
        category: "Quality",
        applicableFrameworks: ["ISO 9001"],
        nextReviewMonths: 12,
        controlIds: ["9.1.1", "9.1.2", "9.1.3"],
        content: `## Purpose
Monitor customer perception and handle complaints to drive improvement (Clauses 9.1.1–9.1.3).

## Procedure
- Determine what to monitor and measure for customer satisfaction (surveys, feedback, complaint trends, on-time delivery, returns).
- Log and investigate complaints; link systemic issues to Corrective Action (10.2).
- Analyse and evaluate the data; report trends as an input to management review (9.3).

## Records
Complaint log; satisfaction survey results; analysis reports.

## Review
Reviewed annually.`,
    },
];
