"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Server, Lock, Fingerprint, Eye, ChevronRight, CheckCircle2, AlertTriangle, AlertCircle, Maximize2, ChevronDown, FileText, FileJson, FileBadge, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Mock Data ────────────────────────────────────────────────────
const tscDomains = [
    { id: "security", name: "Security", icon: ShieldCheck, status: "Good", progress: 85 },
    { id: "availability", name: "Availability", icon: Server, status: "Warning", progress: 62 },
    { id: "confidentiality", name: "Confidentiality", icon: Lock, status: "Good", progress: 91 },
    { id: "processing", name: "Processing Integrity", icon: Fingerprint, status: "Critical", progress: 34 },
    { id: "privacy", name: "Privacy", icon: Eye, status: "Warning", progress: 58 },
];

const categoriesData: Record<string, any[]> = {
    security: [
        { id: "cc1", name: "Control Environment (CC1)", count: 5, passed: 5 },
        { id: "cc2", name: "Communication & Information (CC2)", count: 3, passed: 2 },
        { id: "cc3", name: "Risk Assessment (CC3)", count: 4, passed: 3 },
        { id: "cc4", name: "Monitoring Activities (CC4)", count: 2, passed: 2 },
        { id: "cc5", name: "Control Activities (CC5)", count: 7, passed: 4 },
        { id: "cc6", name: "Logical & Physical Access (CC6)", count: 8, passed: 7 },
    ],
    availability: [
        { id: "a1", name: "System Availability (A1)", count: 3, passed: 2 },
    ],
    confidentiality: [
        { id: "c1", name: "Confidentiality Processing (C1)", count: 2, passed: 2 },
    ],
    processing: [
        { id: "pi1", name: "System Processing (PI1)", count: 5, passed: 1 },
    ],
    privacy: [
        { id: "p1", name: "Notice & Communication (P1)", count: 8, passed: 4 },
        { id: "p2", name: "Choice & Consent (P2)", count: 3, passed: 2 },
    ]
};

const controlsData: Record<string, any[]> = {
    cc1: [
        { id: "CC1.1", desc: "Entity demonstrates commitment to integrity and ethical values.", status: "passed", type: "Automated" },
        { id: "CC1.2", desc: "Board of directors demonstrates independence from management.", status: "passed", type: "Manual" },
        { id: "CC1.3", desc: "Management establishes structures, reporting lines, and authorities.", status: "passed", type: "Manual" },
        { id: "CC1.4", desc: "Entity demonstrates commitment to attract, develop, and retain competent individuals.", status: "passed", type: "Manual" },
        { id: "CC1.5", desc: "Entity holds individuals accountable for internal control responsibilities.", status: "passed", type: "Automated" },
    ],
    cc2: [
        { id: "CC2.1", desc: "Entity obtains or generates and uses relevant, quality information.", status: "passed", type: "Automated" },
        { id: "CC2.2", desc: "Entity internally communicates information, including objectives and responsibilities for internal control.", status: "failed", type: "Manual" },
        { id: "CC2.3", desc: "Entity communicates with external parties regarding matters affecting functioning of internal control.", status: "passed", type: "Manual" },
    ],
    cc3: [
        { id: "CC3.1", desc: "Entity specifies objectives with sufficient clarity to enable identification of risks.", status: "passed", type: "Manual" },
        { id: "CC3.2", desc: "Entity identifies risks to the achievement of its objectives.", status: "passed", type: "Automated" },
        { id: "CC3.3", desc: "Entity considers the potential for fraud in assessing risks.", status: "failed", type: "Manual" },
        { id: "CC3.4", desc: "Entity identifies and assesses changes that could significantly impact internal control.", status: "passed", type: "Automated" },
    ],
    cc4: [
        { id: "CC4.1", desc: "Entity selects, develops, and performs ongoing and/or separate evaluations.", status: "passed", type: "Automated" },
        { id: "CC4.2", desc: "Entity evaluates and communicates internal control deficiencies in a timely manner.", status: "passed", type: "Manual" },
    ],
    cc5: [
        { id: "CC5.1", desc: "Entity selects and develops control activities that contribute to the mitigation of risks.", status: "passed", type: "Automated" },
        { id: "CC5.2", desc: "Entity also selects and develops general control activities over technology.", status: "failed", type: "Automated" },
        { id: "CC5.3", desc: "Entity deploys control activities through policies and procedures.", status: "passed", type: "Manual" },
        { id: "CC5.4", desc: "SDLC change management controls are documented and followed.", status: "failed", type: "Automated" },
        { id: "CC5.5", desc: "Entity implements segregation of duties or compensating controls.", status: "passed", type: "Manual" },
        { id: "CC5.6", desc: "Entity implements logical access security over infrastructure management.", status: "passed", type: "Automated" },
        { id: "CC5.7", desc: "Entity restricts registration and issuance of IT credentials.", status: "failed", type: "Automated" },
    ],
    cc6: [
        { id: "CC6.1", desc: "Entity implements logical access security software, infrastructure, and architectures.", status: "passed", type: "Automated" },
        { id: "CC6.2", desc: "Entity registers and authorizes new internal and external users.", status: "passed", type: "Automated" },
        { id: "CC6.3", desc: "Entity authorizes, modifies, or removes access to data, software, functions.", status: "passed", type: "Automated" },
        { id: "CC6.4", desc: "Entity restricts physical access to facilities and protected information assets.", status: "failed", type: "Manual" },
        { id: "CC6.5", desc: "Entity discontinues logical and physical protections over physical assets.", status: "passed", type: "Manual" },
        { id: "CC6.6", desc: "Entity implements logical access security measures to protect against threats from outside boundaries.", status: "passed", type: "Automated" },
        { id: "CC6.7", desc: "Entity restricts the transmission, movement, and removal of information.", status: "passed", type: "Automated" },
        { id: "CC6.8", desc: "Entity implements controls to prevent or detect and act upon the introduction of unauthorized software.", status: "passed", type: "Automated" },
    ],
    a1: [
        { id: "A1.1", desc: "Entity maintains, monitors, and evaluates current processing capacity and use of system components.", status: "passed", type: "Automated" },
        { id: "A1.2", desc: "Entity authorizes, designs, develops or acquires, implements, operates, and maintains environmental protections.", status: "failed", type: "Manual" },
        { id: "A1.3", desc: "Entity tests recovery plan procedures supporting system recovery to meet its objectives.", status: "passed", type: "Automated" },
    ],
    c1: [
        { id: "C1.1", desc: "Entity identifies and maintains confidential information to meet confidentiality commitments.", status: "passed", type: "Automated" },
        { id: "C1.2", desc: "Entity disposes of confidential information to meet confidentiality commitments.", status: "passed", type: "Manual" },
    ],
    pi1: [
        { id: "PI1.1", desc: "Entity obtains or generates, uses and communicates relevant, quality info regarding processing objectives.", status: "failed", type: "Automated" },
        { id: "PI1.2", desc: "System processing is complete, valid, accurate, timely, and authorized.", status: "failed", type: "Automated" },
        { id: "PI1.3", desc: "System output is complete, valid, accurate, timely, and authorized.", status: "pending", type: "Manual" },
        { id: "PI1.4", desc: "Entity implements policies and procedures to make info available for downstream processing.", status: "failed", type: "Automated" },
        { id: "PI1.5", desc: "Entity implements quality assurance process for system processing.", status: "failed", type: "Manual" },
    ],
    p1: [
        { id: "P1.1", desc: "Entity provides notice to data subjects about its privacy practices to meet its objectives.", status: "passed", type: "Manual" },
        { id: "P1.2", desc: "Entity communicates data subjects' personal info to identified third parties.", status: "passed", type: "Manual" },
        { id: "P1.3", desc: "Entity collects personal info consistent with privacy notice.", status: "failed", type: "Automated" },
        { id: "P1.4", desc: "Entity limits the use of personal information to the purposes identified in notice.", status: "passed", type: "Automated" },
        { id: "P1.5", desc: "Entity retains personal info consistent with its objectives.", status: "passed", type: "Automated" },
        { id: "P1.6", desc: "Entity disposes personal info in accordance with data retention policies.", status: "failed", type: "Manual" },
        { id: "P1.7", desc: "Entity discloses personal info to authorized third parties.", status: "passed", type: "Manual" },
        { id: "P1.8", desc: "Entity informs data subjects of corrections or modifications.", status: "failed", type: "Manual" },
    ],
    p2: [
        { id: "P2.1", desc: "Entity communicates choices available regarding the collection, use, retention, and disposal of personal info.", status: "passed", type: "Manual" },
        { id: "P2.2", desc: "Entity obtains and documents consent from data subjects for processing personal info.", status: "failed", type: "Automated" },
        { id: "P2.3", desc: "Entity provides mechanisms for data subjects to update or delete their personal information.", status: "passed", type: "Automated" },
    ]
};

// Per-control evidence file mapping
const evidenceData: Record<string, { files: { name: string; type: string; icon: any }[] }> = {
    "CC1.1": { files: [{ name: "Code of Ethics Policy.pdf", type: "PDF", icon: FileBadge }, { name: "Annual Ethics Training Log", type: "XLSX", icon: FileText }] },
    "CC1.2": { files: [{ name: "Board Meeting Minutes Q3.pdf", type: "PDF", icon: FileBadge }] },
    "CC1.3": { files: [{ name: "Org Chart v4.2.pdf", type: "PDF", icon: FileBadge }, { name: "RACI Matrix.xlsx", type: "XLSX", icon: FileText }] },
    "CC1.4": { files: [{ name: "HR Onboarding Checklist.pdf", type: "PDF", icon: FileBadge }, { name: "Training Completion Report.json", type: "JSON", icon: FileJson }] },
    "CC1.5": { files: [{ name: "Performance Review Policy.pdf", type: "PDF", icon: FileBadge }] },
    "CC2.1": { files: [{ name: "Data Quality Framework.pdf", type: "PDF", icon: FileBadge }] },
    "CC2.2": { files: [{ name: "Internal Communication Policy.pdf", type: "PDF", icon: FileBadge }] },
    "CC2.3": { files: [{ name: "External Communication Log.xlsx", type: "XLSX", icon: FileText }] },
    "CC3.1": { files: [{ name: "Strategic Objectives Doc.pdf", type: "PDF", icon: FileBadge }] },
    "CC3.2": { files: [{ name: "Enterprise Risk Register.xlsx", type: "XLSX", icon: FileText }, { name: "Risk Assessment Report.pdf", type: "PDF", icon: FileBadge }] },
    "CC3.3": { files: [{ name: "Fraud Risk Assessment.pdf", type: "PDF", icon: FileBadge }] },
    "CC3.4": { files: [{ name: "Change Impact Analysis.xlsx", type: "XLSX", icon: FileText }] },
    "CC4.1": { files: [{ name: "Continuous Monitoring Config.json", type: "JSON", icon: FileJson }] },
    "CC4.2": { files: [{ name: "Deficiency Tracker.xlsx", type: "XLSX", icon: FileText }] },
    "CC5.1": { files: [{ name: "Control Matrix.xlsx", type: "XLSX", icon: FileText }] },
    "CC5.2": { files: [{ name: "IT General Controls Audit.pdf", type: "PDF", icon: FileBadge }] },
    "CC5.3": { files: [{ name: "Policy & Procedure Manual.pdf", type: "PDF", icon: FileBadge }] },
    "CC5.4": { files: [{ name: "SDLC Change Log.json", type: "JSON", icon: FileJson }] },
    "CC5.5": { files: [{ name: "SoD Matrix.xlsx", type: "XLSX", icon: FileText }] },
    "CC5.6": { files: [{ name: "Infrastructure Access Report.json", type: "JSON", icon: FileJson }] },
    "CC5.7": { files: [{ name: "Credential Issuance Policy.pdf", type: "PDF", icon: FileBadge }] },
    "CC6.1": { files: [{ name: "AWS IAM Policy Export.json", type: "JSON", icon: FileJson }, { name: "Azure AD Config.json", type: "JSON", icon: FileJson }] },
    "CC6.2": { files: [{ name: "User Provisioning Workflow.pdf", type: "PDF", icon: FileBadge }] },
    "CC6.3": { files: [{ name: "Access Review Report Q3.xlsx", type: "XLSX", icon: FileText }] },
    "CC6.4": { files: [{ name: "Physical Access Audit.pdf", type: "PDF", icon: FileBadge }] },
    "CC6.5": { files: [{ name: "Asset Decommission Log.xlsx", type: "XLSX", icon: FileText }] },
    "CC6.6": { files: [{ name: "Firewall Rules Export.json", type: "JSON", icon: FileJson }, { name: "WAF Config.json", type: "JSON", icon: FileJson }] },
    "CC6.7": { files: [{ name: "DLP Policy Config.json", type: "JSON", icon: FileJson }] },
    "CC6.8": { files: [{ name: "Endpoint Security Report.pdf", type: "PDF", icon: FileBadge }] },
    "A1.1": { files: [{ name: "Capacity Monitor Dashboard.json", type: "JSON", icon: FileJson }] },
    "A1.2": { files: [{ name: "Environmental Controls Audit.pdf", type: "PDF", icon: FileBadge }] },
    "A1.3": { files: [{ name: "DR Test Results Q3.pdf", type: "PDF", icon: FileBadge }, { name: "Recovery Playbook.pdf", type: "PDF", icon: FileBadge }] },
    "C1.1": { files: [{ name: "Data Classification Policy.pdf", type: "PDF", icon: FileBadge }, { name: "DLP Config.json", type: "JSON", icon: FileJson }] },
    "C1.2": { files: [{ name: "Data Disposal Certificate.pdf", type: "PDF", icon: FileBadge }] },
    "PI1.1": { files: [{ name: "Data Quality Rules.json", type: "JSON", icon: FileJson }] },
    "PI1.2": { files: [{ name: "Processing Validation Report.xlsx", type: "XLSX", icon: FileText }] },
    "PI1.3": { files: [{ name: "Output Verification Log.xlsx", type: "XLSX", icon: FileText }] },
    "PI1.4": { files: [{ name: "Data Pipeline Config.json", type: "JSON", icon: FileJson }] },
    "PI1.5": { files: [{ name: "QA Process Document.pdf", type: "PDF", icon: FileBadge }] },
    "P1.1": { files: [{ name: "Privacy Notice v3.pdf", type: "PDF", icon: FileBadge }] },
    "P1.2": { files: [{ name: "Third-Party Disclosure Log.xlsx", type: "XLSX", icon: FileText }] },
    "P1.3": { files: [{ name: "Collection Consent Records.json", type: "JSON", icon: FileJson }] },
    "P1.4": { files: [{ name: "Purpose Limitation Policy.pdf", type: "PDF", icon: FileBadge }] },
    "P1.5": { files: [{ name: "Retention Schedule.xlsx", type: "XLSX", icon: FileText }] },
    "P1.6": { files: [{ name: "Data Disposal Procedure.pdf", type: "PDF", icon: FileBadge }] },
    "P1.7": { files: [{ name: "Third-Party Agreements.pdf", type: "PDF", icon: FileBadge }] },
    "P1.8": { files: [{ name: "Data Correction Log.xlsx", type: "XLSX", icon: FileText }] },
    "P2.1": { files: [{ name: "Consent Management Platform Config.json", type: "JSON", icon: FileJson }] },
    "P2.2": { files: [{ name: "Consent Forms Archive.pdf", type: "PDF", icon: FileBadge }] },
    "P2.3": { files: [{ name: "Data Subject Portal Audit.pdf", type: "PDF", icon: FileBadge }] },
};

// ─── Per-Control Heatmap Configuration ────────────────────────────
// Categories (rows) and subcategories (columns) vary based on the control ID prefix
interface HeatmapConfig {
    rows: string[];
    cols: string[];
}

function getHeatmapConfig(controlId: string): HeatmapConfig {
    const prefix = controlId.split(".")[0].toUpperCase();

    switch (prefix) {
        case "CC1":
            return {
                rows: ["HR", "Legal", "Operations", "Executive"],
                cols: ["Ethics Training", "Code Review", "Policy Updates", "Reporting", "Governance"],
            };
        case "CC2":
            return {
                rows: ["Internal", "External", "Board", "Stakeholders"],
                cols: ["Channels", "Data Quality", "Timeliness", "Accuracy", "Completeness"],
            };
        case "CC3":
            return {
                rows: ["Strategic", "Operational", "Financial", "Compliance"],
                cols: ["Identification", "Analysis", "Response", "Monitoring", "Fraud Assessment"],
            };
        case "CC4":
            return {
                rows: ["Automated", "Manual", "Continuous", "Periodic"],
                cols: ["Detection", "Evaluation", "Reporting", "Remediation"],
            };
        case "CC5":
            return {
                rows: ["Applications", "Infrastructure", "Databases", "CI/CD"],
                cols: ["SoD", "Change Mgmt", "IT Controls", "Access Review", "Deployment"],
            };
        case "CC6":
            return {
                rows: ["AWS", "Azure", "GCP", "On-Premise"],
                cols: ["IAM", "Network Security", "Data Protection", "Encryption", "Logging & Monitoring", "Incident Response"],
            };
        case "A1":
            return {
                rows: ["Primary DC", "DR Site", "CDN / Edge", "Cloud Regions"],
                cols: ["Uptime", "Failover", "RTO", "RPO", "Scaling"],
            };
        case "C1":
            return {
                rows: ["SaaS", "IaaS", "PaaS", "On-Premise"],
                cols: ["Classification", "Access Control", "DLP", "Key Mgmt", "Monitoring"],
            };
        case "PI1":
            return {
                rows: ["APIs", "Databases", "Pipelines", "Reports"],
                cols: ["Validation", "Processing", "Completeness", "Accuracy", "Timeliness"],
            };
        case "P1":
            return {
                rows: ["Web App", "Mobile App", "APIs", "Third-Party"],
                cols: ["Notice", "Collection", "Consent", "Retention", "Subject Rights"],
            };
        case "P2":
            return {
                rows: ["Web App", "Mobile App", "Email", "Third-Party"],
                cols: ["Opt-In", "Opt-Out", "Data Sharing", "Cookies", "Preferences"],
            };
        default:
            return {
                rows: ["AWS", "Azure", "GCP", "On-Premise"],
                cols: ["IAM", "Network Security", "Data Protection", "Encryption", "Logging & Monitoring"],
            };
    }
}

// ─── Category → Subcategory Tree Data ─────────────────────────────
interface TreeNode {
    name: string;
    children: string[];
}

function getCategoryTree(controlId: string): TreeNode[] {
    const prefix = controlId.split(".")[0].toUpperCase();

    switch (prefix) {
        case "CC1":
            return [
                { name: "Governance", children: ["Board Oversight", "Ethics Program", "Code of Conduct"] },
                { name: "Human Resources", children: ["Recruitment Standards", "Competency Framework", "Performance Accountability"] },
                { name: "Organizational Structure", children: ["Reporting Lines", "Authority Delegation", "Role Segregation"] },
            ];
        case "CC2":
            return [
                { name: "Internal Communication", children: ["Policy Distribution", "Training Notices", "Control Objectives"] },
                { name: "External Communication", children: ["Regulatory Reporting", "Vendor Communication", "Stakeholder Updates"] },
                { name: "Information Quality", children: ["Data Accuracy", "Completeness Checks", "Timeliness Standards"] },
            ];
        case "CC3":
            return [
                { name: "Risk Identification", children: ["Threat Modeling", "Vulnerability Scanning", "Business Impact"] },
                { name: "Risk Analysis", children: ["Likelihood Assessment", "Impact Rating", "Inherent vs. Residual"] },
                { name: "Risk Response", children: ["Mitigation Plans", "Risk Acceptance", "Transfer / Avoidance"] },
            ];
        case "CC4":
            return [
                { name: "Ongoing Monitoring", children: ["Automated Alerts", "SIEM Integration", "Health Dashboards"] },
                { name: "Separate Evaluations", children: ["Internal Audit", "External Audit", "Penetration Testing"] },
                { name: "Deficiency Mgmt", children: ["Root Cause Analysis", "Remediation Tracking", "Escalation Procedures"] },
            ];
        case "CC5":
            return [
                { name: "IT General Controls", children: ["Change Management", "Patch Management", "Configuration Mgmt"] },
                { name: "Control Activities", children: ["Separation of Duties", "Reconciliation", "Authorization Controls"] },
                { name: "Technology Controls", children: ["SDLC Lifecycle", "Code Review", "Deployment Gates"] },
            ];
        case "CC6":
            return [
                { name: "Logical Access", children: ["IAM Policies", "MFA Enforcement", "RBAC / ABAC", "SSO Integration"] },
                { name: "Physical Access", children: ["Badge Systems", "Biometric Controls", "Visitor Management"] },
                { name: "Network Security", children: ["Firewall Rules", "WAF", "Micro-Segmentation", "VPN / Zero Trust"] },
                { name: "Data Security", children: ["Encryption at Rest", "Encryption in Transit", "DLP Policies"] },
            ];
        case "A1":
            return [
                { name: "Capacity Management", children: ["Auto-Scaling", "Load Balancing", "Resource Monitoring"] },
                { name: "Disaster Recovery", children: ["DR Plans", "RTO/RPO Targets", "Geo-Redundancy"] },
                { name: "Backup & Restore", children: ["Automated Backups", "Point-in-Time Recovery", "Backup Validation"] },
            ];
        case "C1":
            return [
                { name: "Data Classification", children: ["Public", "Internal", "Confidential", "Restricted"] },
                { name: "Data Protection", children: ["Access Restrictions", "Encryption", "Tokenization"] },
                { name: "Data Lifecycle", children: ["Retention Policy", "Secure Disposal", "Archival"] },
            ];
        case "PI1":
            return [
                { name: "Input Controls", children: ["Schema Validation", "Data Type Checks", "Range Validation"] },
                { name: "Processing Controls", children: ["Batch Integrity", "Error Handling", "Transaction Logging"] },
                { name: "Output Controls", children: ["Completeness Checks", "Reconciliation", "Distribution Controls"] },
            ];
        case "P1":
            return [
                { name: "Privacy Notice", children: ["Purpose Statement", "Data Types Collected", "Third-Party Sharing"] },
                { name: "Data Collection", children: ["Consent Capture", "Minimal Data Principle", "Lawful Basis"] },
                { name: "Subject Rights", children: ["Access Requests", "Rectification", "Erasure (RTBF)", "Portability"] },
            ];
        case "P2":
            return [
                { name: "Consent Management", children: ["Granular Opt-In", "Easy Opt-Out", "Consent Versioning"] },
                { name: "Data Sharing", children: ["Third-Party Agreements", "Cross-Border Transfers", "Sub-Processors"] },
                { name: "Cookie Management", children: ["Cookie Banner", "Category Controls", "Preference Center"] },
            ];
        default:
            return [
                { name: "General", children: ["Category A", "Category B", "Category C"] },
            ];
    }
}

// ─── Seeded random for deterministic heatmap ──────────────────────
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};
const stringToSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

function getIntensityClass(value: number): string {
    if (value >= 0.85) return "bg-emerald-500/80 text-emerald-50 shadow-emerald-500/20";
    if (value >= 0.7) return "bg-emerald-600/60 text-emerald-100";
    if (value >= 0.5) return "bg-teal-600/50 text-teal-100";
    if (value >= 0.35) return "bg-amber-500/50 text-amber-100";
    if (value >= 0.2) return "bg-orange-500/40 text-orange-100";
    return "bg-red-500/35 text-red-200";
}

function getIntensityLabel(value: number): string {
    if (value >= 0.85) return "Strong";
    if (value >= 0.7) return "Good";
    if (value >= 0.5) return "Partial";
    if (value >= 0.35) return "Weak";
    if (value >= 0.2) return "Low";
    return "Gap";
}

// ─── Category → Subcategory Tree Component ────────────────────────
function CategoryTree({ controlId }: { controlId: string }) {
    const treeData = getCategoryTree(controlId);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(treeData.map(n => n.name)));

    const toggleNode = (name: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mb-5 bg-slate-900/30 rounded-xl border border-slate-800/40 p-4"
        >
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
                <Layers className="w-3 h-3" />
                <span>Category → Subcategories</span>
            </span>
            <div className="flex flex-col space-y-2">
                {treeData.map((node, nodeIdx) => {
                    const isOpen = expandedNodes.has(node.name);
                    return (
                        <motion.div
                            key={node.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: nodeIdx * 0.05 }}
                            className="flex items-center gap-2.5"
                        >
                            {/* Parent Node */}
                            <button
                                onClick={() => toggleNode(node.name)}
                                className={cn(
                                    "flex-shrink-0 w-44 flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all text-left",
                                    isOpen
                                        ? "bg-blue-500/8 border-blue-500/25 shadow-[0_0_16px_rgba(59,130,246,0.06)]"
                                        : "bg-slate-800/50 border-slate-700/40 hover:border-slate-600"
                                )}
                            >
                                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronRight className={cn("w-3 h-3 flex-shrink-0", isOpen ? "text-blue-400" : "text-slate-500")} />
                                </motion.div>
                                <span className={cn("text-[11px] font-semibold truncate", isOpen ? "text-blue-300" : "text-slate-300")}>
                                    {node.name}
                                </span>
                            </button>

                            {/* Arrow connector */}
                            <div className="flex items-center flex-shrink-0">
                                <div className={cn("w-5 h-[1.5px] transition-colors rounded-full", isOpen ? "bg-blue-500/40" : "bg-slate-700/60")} />
                                <ArrowRight className={cn("w-3 h-3 -ml-0.5 transition-colors", isOpen ? "text-blue-400/60" : "text-slate-700")} />
                            </div>

                            {/* Children */}
                            <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
                                <AnimatePresence>
                                    {isOpen && node.children.map((child, childIdx) => (
                                        <motion.div
                                            key={child}
                                            initial={{ opacity: 0, scale: 0.85, y: 4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.85, y: 4 }}
                                            transition={{ delay: childIdx * 0.03, duration: 0.2 }}
                                            className="text-[10px] font-medium text-slate-300 bg-slate-800/70 border border-slate-700/40 px-2.5 py-1.5 rounded-lg hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-300 transition-all cursor-default whitespace-nowrap"
                                        >
                                            {child}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ─── Evidence Heatmap Inline (Per-Control) ────────────────────────
function EvidenceHeatmapInline({ controlId }: { controlId: string }) {
    const config = getHeatmapConfig(controlId);
    const baseSeed = stringToSeed(controlId);

    const heatmapData = React.useMemo(() => {
        return config.rows.map((_, catIdx) =>
            config.cols.map((_, subIdx) => {
                return seededRandom(baseSeed + catIdx * 100 + subIdx * 17);
            })
        );
    }, [baseSeed, config.rows.length, config.cols.length]);

    const files = evidenceData[controlId]?.files || [
        { name: "Evidence Artifact.pdf", type: "PDF", icon: FileBadge },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 pt-4 border-t border-slate-700/40"
        >
            {/* Linked Evidence Files */}
            <div className="mb-5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Linked Evidence</span>
                <div className="flex flex-wrap gap-2">
                    {files.map((file, i) => (
                        <div
                            key={i}
                            className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 cursor-pointer hover:border-blue-500/30 hover:bg-slate-800 transition-all group"
                        >
                            <file.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{file.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">{file.type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category → Subcategory Tree (ABOVE heatmap) */}
            <CategoryTree controlId={controlId} />

            {/* Heatmap Grid */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Coverage Heatmap</span>
                    <div className="flex items-center space-x-1 text-[9px] text-slate-500">
                        <span>Gap</span>
                        <div className="flex space-x-px">
                            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/35" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-orange-500/40" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-teal-600/50" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600/60" />
                            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
                        </div>
                        <span>Strong</span>
                    </div>
                </div>

                <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${config.cols.length}, 1fr)` }}>
                    {/* Column Headers */}
                    <div />
                    {config.cols.map((sub) => (
                        <div
                            key={sub}
                            className="text-[9px] font-medium text-slate-500 text-center px-0.5 truncate"
                            title={sub}
                        >
                            {sub}
                        </div>
                    ))}

                    {/* Data Rows */}
                    {config.rows.map((cat, catIdx) => (
                        <React.Fragment key={cat}>
                            <div className="text-[11px] font-semibold text-slate-300 flex items-center truncate" title={cat}>
                                {cat}
                            </div>
                            {heatmapData[catIdx].map((value, subIdx) => (
                                <motion.div
                                    key={`${catIdx}-${subIdx}`}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: 0.1 + catIdx * 0.05 + subIdx * 0.03,
                                        duration: 0.25,
                                        ease: "easeOut",
                                    }}
                                    className={cn(
                                        "rounded-md h-8 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:ring-1 hover:ring-white/20 hover:shadow-lg hover:z-10",
                                        getIntensityClass(value)
                                    )}
                                    title={`${cat} → ${config.cols[subIdx]}: ${Math.round(value * 100)}%`}
                                >
                                    <span className="text-[9px] font-bold opacity-90">
                                        {getIntensityLabel(value)}
                                    </span>
                                </motion.div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────
export function ControlsBreakdownUX() {
    const [selectedDomain, setSelectedDomain] = useState(tscDomains[0].id);
    const [selectedCategory, setSelectedCategory] = useState("cc6");
    const [expandedControlId, setExpandedControlId] = useState<string | null>(null);

    const activeCategories = categoriesData[selectedDomain] || [];
    const activeControls = controlsData[selectedCategory] || [
        { id: `${selectedCategory.toUpperCase()}.1`, desc: "Placeholder control description for structural completeness.", status: "pending", type: "Automated" },
        { id: `${selectedCategory.toUpperCase()}.2`, desc: "Ensure automated scanners are bound to the correct asset groups.", status: "failed", type: "Automated" },
        { id: `${selectedCategory.toUpperCase()}.3`, desc: "Quarterly review of IAM permissions and role-based policies.", status: "passed", type: "Manual" },
    ];

    return (
        <div className="w-full h-full flex gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Level 1: Domains */}
            <div className="w-64 flex-shrink-0 flex flex-col space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-1">TSC Domains</span>
                {tscDomains.map((domain) => {
                    const isActive = selectedDomain === domain.id;
                    return (
                        <button
                            key={domain.id}
                            onClick={() => {
                                setSelectedDomain(domain.id);
                                setSelectedCategory(categoriesData[domain.id]?.[0]?.id || "");
                                setExpandedControlId(null);
                            }}
                            className={cn(
                                "flex items-center w-full px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden group border",
                                isActive
                                    ? "bg-slate-800/80 border-slate-700 shadow-xl"
                                    : "bg-slate-900/30 border-transparent hover:bg-slate-800/40"
                            )}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />}

                            <domain.icon className={cn(
                                "w-5 h-5 flex-shrink-0 mr-3 transition-colors",
                                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"
                            )} />

                            <div className="flex flex-col items-start w-full">
                                <span className={cn("text-sm font-semibold tracking-wide transition-colors", isActive ? "text-slate-100" : "text-slate-400 group-hover:text-slate-200")}>
                                    {domain.name}
                                </span>
                                <div className="w-full mt-2 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000",
                                            domain.status === "Good" ? "bg-emerald-500" : domain.status === "Warning" ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${domain.progress}%` }}
                                    />
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Level 2: Categories (Sub-Domains) */}
            <div className="w-80 flex-shrink-0 flex flex-col border-l border-slate-800/50 pl-6 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-1">Categories</span>
                <AnimatePresence mode="popLayout">
                    {activeCategories.map((category, idx) => {
                        const isActive = selectedCategory === category.id;
                        const progressPct = Math.round((category.passed / category.count) * 100);
                        return (
                            <motion.button
                                key={category.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => { setSelectedCategory(category.id); setExpandedControlId(null); }}
                                className={cn(
                                    "flex flex-col w-full text-left p-4 rounded-xl transition-all duration-200 border",
                                    isActive
                                        ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)]"
                                        : "bg-slate-900/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex justify-between items-start w-full mb-2">
                                    <span className={cn("text-sm font-medium", isActive ? "text-indigo-300" : "text-slate-300")}>
                                        {category.name}
                                    </span>
                                    {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                                        {category.passed}/{category.count} Controls
                                    </span>
                                    <span className={cn("text-[10px] font-bold", progressPct === 100 ? "text-emerald-400" : progressPct > 50 ? "text-amber-400" : "text-red-400")}>
                                        {progressPct}%
                                    </span>
                                </div>
                            </motion.button>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Level 3: Controls Detail Matrix */}
            <div className="flex-1 flex flex-col border-l border-slate-800/50 pl-6 pt-2">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/50 mb-4">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                        <span className="text-indigo-400 mr-2">{activeCategories.find(c => c.id === selectedCategory)?.name || "Sub-controls"}</span>
                        Metrics
                    </h3>
                    <button className="text-xs flex items-center bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition">
                        <Maximize2 className="w-3 h-3 mr-1.5" /> Full Screen
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                    <AnimatePresence mode="popLayout">
                        {activeControls.map((control, idx) => {
                            const isExpanded = expandedControlId === control.id;
                            return (
                                <motion.div
                                    key={control.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setExpandedControlId(isExpanded ? null : control.id)}
                                    className={cn(
                                        "glass-panel p-4 rounded-xl border flex flex-col transition-all group cursor-pointer",
                                        isExpanded
                                            ? "border-blue-500/30 bg-blue-500/[0.03] shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                                            : "border-slate-800/50 hover:border-indigo-500/20 hover:bg-slate-800/30"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            <div className="mt-1 mr-3">
                                                {control.status === "passed" ? (
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                    </div>
                                                ) : control.status === "failed" ? (
                                                    <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-slate-700/50 px-2 py-0.5 rounded shadow-inner">
                                                        {control.id}
                                                    </span>
                                                    <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                                        {control.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                    {control.desc}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Expand indicator — always visible, entire row is clickable */}
                                        <div className={cn(
                                            "flex items-center space-x-1.5 text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded border transition-all flex-shrink-0 ml-3",
                                            isExpanded
                                                ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                                                : "text-slate-500 bg-slate-800/40 border-slate-700/50 group-hover:text-indigo-400 group-hover:border-indigo-500/20 group-hover:bg-indigo-500/10"
                                        )}>
                                            <span>{isExpanded ? "Collapse" : "Expand"}</span>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Expanded Evidence + Heatmap + Tree */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <EvidenceHeatmapInline controlId={control.id} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
