"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    FolderGit2, CloudUpload, Search, X, AlertCircle, CheckCircle2,
    FileText, FileImage, FileCode, File, Trash2,
    RotateCcw, Plus, AlertTriangle, Clock, Download,
    ChevronDown, ChevronRight, Shield, Lock, Users, Activity,
    Database, Globe, Server, Eye
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EvidenceArtifact {
    id: string;
    org_id: string;
    control_id: string | null;
    name: string;
    description: string | null;
    file_url: string | null;
    file_type: string | null;
    file_size: number | null;
    uploaded_by: string | null;
    status: string;
    expires_at: string | null;
    created_at: string;
    uploader: { id: string; full_name: string | null } | null;
}

export interface Control {
    id: string;
    control_id: string;
    title: string;
    domain: string | null;
    framework_id: string;
}

interface EvidenceVaultClientProps {
    initialArtifacts: EvidenceArtifact[];
    controls: Control[];
    orgId: string;
    currentUserId: string;
}

// ─── Required Evidence Catalog ────────────────────────────────────────────────

interface RequiredEvidence {
    id: string;
    category: string;
    name: string;
    description: string;
    example: string;
    controls: string[];      // framework control IDs this satisfies
    frameworks: string[];    // framework short names
    frequency: string;       // how often it needs refreshing
}

const REQUIRED_EVIDENCE: RequiredEvidence[] = [
    // Access Control
    {
        id: "req-access-review",
        category: "Access Control",
        name: "User Access Review",
        description: "Periodic review confirming all user accounts, roles and privileges are appropriate.",
        example: "Quarterly access review spreadsheet signed off by department heads, showing current users and their access levels.",
        controls: ["CC6.1", "CC6.2", "A.9.2.5"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Quarterly",
    },
    {
        id: "req-rbac",
        category: "Access Control",
        name: "Role-Based Access Control Documentation",
        description: "Documentation of roles, permissions, and the least-privilege access model.",
        example: "RBAC matrix or IAM policy export showing each role and what resources it can access.",
        controls: ["CC6.1", "A.9.2.2"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "On change",
    },
    {
        id: "req-privileged",
        category: "Access Control",
        name: "Privileged Access Management Records",
        description: "Logs of privileged/admin account usage, MFA enforcement, and PAM tool exports.",
        example: "AWS CloudTrail root account activity log or CyberArk session recording export for the past 90 days.",
        controls: ["CC6.3", "A.9.2.3"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Monthly",
    },
    // Vulnerability Management
    {
        id: "req-vuln-scan",
        category: "Vulnerability Management",
        name: "Vulnerability Scan Report",
        description: "Output from automated vulnerability scanning of infrastructure and applications.",
        example: "Nessus/Qualys scan report showing open findings with severity, CVSS scores, and remediation status.",
        controls: ["CC7.1", "A.12.6.1"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Monthly",
    },
    {
        id: "req-pentest",
        category: "Vulnerability Management",
        name: "Penetration Test Report",
        description: "Annual third-party penetration test report with findings and remediation evidence.",
        example: "Signed pentest report from a CREST-certified firm, including executive summary, CVSS scores, and fix verification.",
        controls: ["CC7.1", "A.18.2.3"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    // Risk Management
    {
        id: "req-risk-assessment",
        category: "Risk Management",
        name: "Risk Assessment Report",
        description: "Formal risk identification, likelihood and impact analysis for the organisation.",
        example: "Risk register extract with heat map, owner assignments, and treatment options for each risk.",
        controls: ["CC9.1", "A.8.2.1"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    {
        id: "req-risk-treatment",
        category: "Risk Management",
        name: "Risk Treatment Plan",
        description: "Documented decisions on how identified risks will be mitigated, accepted, or transferred.",
        example: "Risk treatment table with risk ID, chosen treatment (mitigate/accept/transfer), owner, and target date.",
        controls: ["CC9.2", "A.8.3"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    // Incident Response
    {
        id: "req-incident-log",
        category: "Incident Response",
        name: "Security Incident Log",
        description: "Chronological record of all security events and incidents, including severity and resolution.",
        example: "Incident tracker export showing incident ID, date, severity, affected system, root cause, and closure date.",
        controls: ["CC7.3", "A.16.1.2"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Ongoing",
    },
    {
        id: "req-ir-test",
        category: "Incident Response",
        name: "Incident Response Tabletop Exercise",
        description: "Evidence that the IR plan has been tested via tabletop or simulation exercise.",
        example: "After-action report from IR tabletop exercise, listing participants, scenario, gaps found, and action items.",
        controls: ["CC7.3", "A.16.1.1"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    // Business Continuity
    {
        id: "req-dr-test",
        category: "Business Continuity",
        name: "Disaster Recovery Test Results",
        description: "Results from testing recovery procedures for critical systems within RTO/RPO targets.",
        example: "DR test report showing which systems were failed over, actual recovery time vs RTO, and pass/fail status.",
        controls: ["A1.2", "A.17.1.3"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    {
        id: "req-bcp",
        category: "Business Continuity",
        name: "Business Continuity / DR Plan",
        description: "Documented BCP/DRP covering critical processes, recovery objectives, and responsible parties.",
        example: "BCP document signed by management listing critical business functions, RTOs, RPOs, and step-by-step recovery runbooks.",
        controls: ["A1.1", "A.17.1.1"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    // HR & Security Awareness
    {
        id: "req-training",
        category: "Security Awareness",
        name: "Security Awareness Training Records",
        description: "Completion records showing all employees have completed required security training.",
        example: "LMS export or signed attendance sheet showing training completion rates by department and date.",
        controls: ["CC1.4", "A.7.2.2"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    {
        id: "req-bgcheck",
        category: "HR Security",
        name: "Background Check Records",
        description: "Evidence that background screening was conducted for employees in sensitive roles.",
        example: "Background screening provider confirmation letters (anonymised) for roles with access to sensitive data.",
        controls: ["CC1.1", "A.7.1.1"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "On hire",
    },
    // Vendor / Third-Party
    {
        id: "req-vendor-assessment",
        category: "Vendor Management",
        name: "Vendor Security Assessments",
        description: "Security questionnaire responses or audit reports from Tier 1 / Tier 2 vendors.",
        example: "Completed CAIQ / SIG questionnaire from top vendors, or shared SOC 2 Type II reports.",
        controls: ["CC9.2", "A.15.2.1"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Annual",
    },
    {
        id: "req-dpa",
        category: "Vendor Management",
        name: "Data Processing Agreements (DPAs)",
        description: "Signed DPAs with all data processors handling personal data.",
        example: "Signed DPA PDFs from each sub-processor listed in your privacy notice (e.g. AWS, Stripe, Twilio).",
        controls: ["A.15.1.2"],
        frameworks: ["ISO 27001", "DPDPA"],
        frequency: "On contract",
    },
    // Monitoring & Logging
    {
        id: "req-audit-logs",
        category: "Monitoring & Logging",
        name: "Audit Log Review Records",
        description: "Evidence of regular review of security-relevant audit logs.",
        example: "SIEM alert dashboard screenshot or weekly log review sign-off document.",
        controls: ["CC7.2", "A.12.4.1"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Weekly",
    },
    // Change Management
    {
        id: "req-change-mgmt",
        category: "Change Management",
        name: "Change Management / Code Review Records",
        description: "Pull request approvals or change tickets demonstrating peer review before deployment.",
        example: "GitHub PR merge history showing reviewer approvals on all production deployments over the past quarter.",
        controls: ["CC8.1", "A.14.2.2"],
        frameworks: ["SOC 2", "ISO 27001"],
        frequency: "Ongoing",
    },
    // Data Protection
    {
        id: "req-data-class",
        category: "Data Protection",
        name: "Data Classification Matrix",
        description: "Documentation classifying organisational data by sensitivity and the handling rules for each class.",
        example: "Data classification table: Public / Internal / Confidential / Restricted with examples and handling rules per class.",
        controls: ["A.8.2.1"],
        frameworks: ["ISO 27001", "DPDPA"],
        frequency: "Annual",
    },
    {
        id: "req-privacy-notice",
        category: "Data Protection",
        name: "Privacy Notice / Policy",
        description: "Published privacy notice describing personal data collection, use, and data subject rights.",
        example: "Privacy policy URL and a PDF snapshot showing effective date, data categories, lawful bases, and contact details.",
        controls: ["DPDPA-6"],
        frameworks: ["DPDPA"],
        frequency: "On change",
    },
    {
        id: "req-breach-log",
        category: "Data Protection",
        name: "Data Breach / Incident Log",
        description: "Register of personal data breaches, their impact, and notification decisions.",
        example: "Breach log table: date, affected individuals, nature of breach, containment action, DPA notification Y/N.",
        controls: ["DPDPA-17", "A.16.1.2"],
        frameworks: ["DPDPA", "ISO 27001"],
        frequency: "Ongoing",
    },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    "Access Control":         Lock,
    "Vulnerability Management": Shield,
    "Risk Management":         AlertTriangle,
    "Incident Response":       Activity,
    "Business Continuity":     Server,
    "Security Awareness":      Users,
    "HR Security":             Users,
    "Vendor Management":       Globe,
    "Monitoring & Logging":    Eye,
    "Change Management":       Database,
    "Data Protection":         FileText,
};

const FW_COLORS: Record<string, string> = {
    "SOC 2":    "text-blue-400 bg-blue-500/10 border-blue-500/30",
    "ISO 27001":"text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    "DPDPA":    "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STALE_DAYS = 90;

function isStale(artifact: EvidenceArtifact): boolean {
    const diffDays = (Date.now() - new Date(artifact.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > STALE_DAYS;
}

function isExpiringSoon(artifact: EvidenceArtifact): boolean {
    if (!artifact.expires_at) return false;
    const diffDays = (new Date(artifact.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 14;
}

function isExpired(artifact: EvidenceArtifact): boolean {
    if (!artifact.expires_at) return false;
    return new Date(artifact.expires_at) < new Date();
}

function formatBytes(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string | null }) {
    if (!type) return <File className="w-5 h-5 text-slate-500" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-400" />;
    if (type.includes("image")) return <FileImage className="w-5 h-5 text-blue-400" />;
    if (type.includes("json") || type.includes("yaml") || type.includes("text")) return <FileCode className="w-5 h-5 text-green-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

interface UploadModalProps {
    orgId: string;
    currentUserId: string;
    controls: Control[];
    prefillName?: string;
    onClose: () => void;
    onUploaded: (artifact: EvidenceArtifact) => void;
}

function UploadModal({ orgId, currentUserId: _, controls, prefillName = "", onClose, onUploaded }: UploadModalProps) {
    const supabase = createClient();
    const [form, setForm] = useState({ name: prefillName, description: "", control_id: "", expires_at: "" });
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Name is required."); return; }
        setUploading(true); setError(null);

        let file_url: string | null = null;
        let file_type: string | null = null;
        let file_size: number | null = null;

        if (file) {
            const ext = file.name.split(".").pop();
            const path = `${orgId}/${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("evidence-artifacts")
                .upload(path, file, { contentType: file.type });
            if (uploadErr) { setError(`Upload failed: ${uploadErr.message}`); setUploading(false); return; }
            const { data: urlData } = supabase.storage.from("evidence-artifacts").getPublicUrl(path);
            file_url = urlData.publicUrl;
            file_type = file.type;
            file_size = file.size;
        }

        const res = await fetch("/api/evidence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                org_id: orgId,
                name: form.name.trim(),
                description: form.description.trim() || null,
                control_id: form.control_id || null,
                expires_at: form.expires_at || null,
                file_url,
                file_type,
                file_size,
            }),
        });
        const json = await res.json();
        if (!res.ok || !json.artifact) { setError(json.error ?? "Save failed."); setUploading(false); return; }
        const data = json.artifact;
        onUploaded({
            ...(data as unknown as EvidenceArtifact),
            uploader: data.profiles as unknown as { id: string; full_name: string | null } | null,
        });
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <CloudUpload className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">Upload Evidence</h2>
                            <p className="text-xs text-slate-500">Add a compliance artifact to the vault</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Evidence Name *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. SOC 2 Audit Report 2025" className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Brief description of what this evidence covers…"
                            className={cn(inputCls, "resize-none")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Link to Control</label>
                            <select value={form.control_id} onChange={e => setForm(f => ({ ...f, control_id: e.target.value }))} className={inputCls}>
                                <option value="">No control linked</option>
                                {controls.map(c => (
                                    <option key={c.id} value={c.id}>{c.control_id} — {c.title.slice(0, 30)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Date</label>
                            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">File (optional)</label>
                        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-700/50 rounded-xl cursor-pointer hover:border-slate-600/50 transition-colors bg-slate-800/30">
                            <div className="flex flex-col items-center space-y-1">
                                <CloudUpload className="w-5 h-5 text-slate-500" />
                                <span className="text-xs text-slate-500">{file ? file.name : "Click to upload a file"}</span>
                            </div>
                            <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                        </label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                        <button type="submit" disabled={uploading}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center space-x-2 transition-colors">
                            {uploading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{uploading ? "Uploading…" : "Upload"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Required Evidence Row ─────────────────────────────────────────────────────

interface RequiredEvidenceRowProps {
    item: RequiredEvidence;
    uploadedNames: Set<string>;
    onUpload: (name: string) => void;
}

function RequiredEvidenceRow({ item, uploadedNames, onUpload }: RequiredEvidenceRowProps) {
    const [expanded, setExpanded] = useState(false);

    // Fuzzy match: is there any artifact whose name contains this item's name keywords?
    const isUploaded = useMemo(() => {
        const key = item.name.toLowerCase();
        for (const n of uploadedNames) {
            if (n.includes(key.slice(0, 12))) return true;
        }
        return false;
    }, [item.name, uploadedNames]);

    const Icon = CATEGORY_ICONS[item.category] ?? FileText;

    return (
        <div className={cn(
            "border-b border-slate-800/50 last:border-b-0 transition-colors",
            isUploaded ? "hover:bg-emerald-500/3" : "hover:bg-slate-800/20"
        )}>
            <div className="flex items-center px-5 py-3 gap-4">
                {/* Status indicator */}
                <div className="shrink-0">
                    {isUploaded
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        : <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                          </div>
                    }
                </div>

                {/* Icon + name */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Icon className={cn("w-4 h-4 shrink-0", isUploaded ? "text-emerald-400" : "text-slate-500")} />
                    <div className="flex flex-col min-w-0">
                        <span className={cn("text-sm font-medium truncate", isUploaded ? "text-emerald-300" : "text-slate-200")}>
                            {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.category} · Refresh: {item.frequency}</span>
                    </div>
                </div>

                {/* Framework badges */}
                <div className="hidden md:flex items-center gap-1.5 shrink-0">
                    {item.frameworks.map(fw => (
                        <span key={fw} className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", FW_COLORS[fw] ?? "text-slate-400 bg-slate-700/30 border-slate-600")}>
                            {fw}
                        </span>
                    ))}
                </div>

                {/* Controls satisfied */}
                <div className="hidden lg:flex items-center gap-1 shrink-0 min-w-[120px]">
                    {item.controls.slice(0, 3).map(c => (
                        <span key={c} className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">
                            {c}
                        </span>
                    ))}
                    {item.controls.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{item.controls.length - 3}</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {!isUploaded && (
                        <button
                            onClick={() => onUpload(item.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-colors"
                        >
                            <CloudUpload className="w-3.5 h-3.5" />
                            Upload
                        </button>
                    )}
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 rounded-lg transition-colors"
                    >
                        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                    >
                        <div className="px-14 pb-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">What to collect</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                                </div>
                                <div className="bg-indigo-500/5 rounded-xl p-3 border border-indigo-500/20">
                                    <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-1.5">Example</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{item.example}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mr-1">Controls fulfilled:</span>
                                {item.controls.map(c => (
                                    <span key={c} className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EvidenceVaultClient({ initialArtifacts, controls, orgId, currentUserId }: EvidenceVaultClientProps) {
    const [artifacts, setArtifacts] = useState<EvidenceArtifact[]>(initialArtifacts);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadPrefill, setUploadPrefill] = useState("");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterControl, setFilterControl] = useState("all");
    const [catalogSearch, setCatalogSearch] = useState("");
    const [catalogFilter, setCatalogFilter] = useState("all");
    const [activeTab, setActiveTab] = useState<"catalog" | "uploads">("catalog");

    const controlMap = useMemo(() => new Map(controls.map(c => [c.id, c])), [controls]);

    // Uploaded evidence names for fuzzy matching against catalog
    const uploadedNames = useMemo(
        () => new Set(artifacts.map(a => a.name.toLowerCase())),
        [artifacts]
    );

    // Stats
    const stats = useMemo(() => {
        const uploaded = REQUIRED_EVIDENCE.filter(req => {
            const key = req.name.toLowerCase();
            for (const n of uploadedNames) if (n.includes(key.slice(0, 12))) return true;
            return false;
        }).length;
        const missing = REQUIRED_EVIDENCE.length - uploaded;
        const stale = artifacts.filter(isStale).length;
        const expiring = artifacts.filter(isExpiringSoon).length;
        const expired = artifacts.filter(isExpired).length;
        return { total: REQUIRED_EVIDENCE.length, uploaded, missing, stale, expiring, expired };
    }, [uploadedNames, artifacts]);

    // Catalog filtering
    const categories = useMemo(() => Array.from(new Set(REQUIRED_EVIDENCE.map(r => r.category))), []);
    const filteredCatalog = useMemo(() => REQUIRED_EVIDENCE.filter(r => {
        if (catalogFilter !== "all" && r.category !== catalogFilter) return false;
        if (catalogSearch && !r.name.toLowerCase().includes(catalogSearch.toLowerCase())
            && !r.category.toLowerCase().includes(catalogSearch.toLowerCase())) return false;
        return true;
    }), [catalogFilter, catalogSearch]);

    // Artifacts filtering
    const filtered = useMemo(() => artifacts.filter(a => {
        if (filterStatus === "stale" && !isStale(a)) return false;
        if (filterStatus === "expiring" && !isExpiringSoon(a)) return false;
        if (filterStatus === "expired" && !isExpired(a)) return false;
        if (filterControl !== "all" && a.control_id !== filterControl) return false;
        if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [artifacts, filterStatus, filterControl, search]);

    const handleUploaded = useCallback((a: EvidenceArtifact) => {
        setArtifacts(prev => [a, ...prev]);
        setActiveTab("uploads");
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        await fetch("/api/evidence", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setArtifacts(prev => prev.filter(a => a.id !== id));
    }, []);

    const openUpload = useCallback((prefill = "") => {
        setUploadPrefill(prefill);
        setShowUpload(true);
    }, []);

    const coveragePct = stats.total > 0 ? Math.round((stats.uploaded / stats.total) * 100) : 0;

    return (
        <div className="w-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <FolderGit2 className="w-8 h-8 mr-3 text-indigo-500" />
                        Evidence Vault
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Required evidence catalog with examples, control mapping, and freshness tracking.</p>
                </div>
                <button
                    onClick={() => openUpload()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-colors flex items-center space-x-2"
                >
                    <CloudUpload className="w-4 h-4" />
                    <span>Upload Artifact</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: "Required",    count: stats.total,    color: "text-slate-100" },
                    { label: "Uploaded",    count: stats.uploaded, color: "text-emerald-400" },
                    { label: "Missing",     count: stats.missing,  color: stats.missing > 0 ? "text-red-400" : "text-slate-400" },
                    { label: "Stale",       count: stats.stale,    color: stats.stale > 0 ? "text-amber-400" : "text-slate-400" },
                    { label: "Expiring",    count: stats.expiring, color: stats.expiring > 0 ? "text-orange-400" : "text-slate-400" },
                    { label: "Expired",     count: stats.expired,  color: stats.expired > 0 ? "text-red-400" : "text-slate-400" },
                ].map((s) => (
                    <div key={s.label} className="glass-panel rounded-2xl p-4 border border-slate-800/50 flex flex-col">
                        <span className="text-[10px] text-slate-500 mb-1">{s.label}</span>
                        <span className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.count}</span>
                    </div>
                ))}
            </div>

            {/* Coverage bar */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">Evidence Coverage</span>
                    <span className="text-sm font-bold text-indigo-400">{coveragePct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${coveragePct}%` }}
                    />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{stats.uploaded} of {stats.total} required evidence items have been uploaded</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-800/40 p-1 rounded-xl w-fit border border-slate-700/30">
                <button
                    onClick={() => setActiveTab("catalog")}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                        activeTab === "catalog"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                    )}
                >
                    Required Evidence ({REQUIRED_EVIDENCE.length})
                </button>
                <button
                    onClick={() => setActiveTab("uploads")}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                        activeTab === "uploads"
                            ? "bg-indigo-600 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                    )}
                >
                    Uploaded Artifacts ({artifacts.length})
                </button>
            </div>

            {/* ── Required Evidence Catalog ── */}
            {activeTab === "catalog" && (
                <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                    {/* Catalog filters */}
                    <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="text" value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                                placeholder="Search required evidence…"
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                        </div>
                        <select value={catalogFilter} onChange={e => setCatalogFilter(e.target.value)}
                            className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <span className="text-xs text-slate-500 ml-auto">{filteredCatalog.length} items</span>
                    </div>

                    {/* Column headers */}
                    <div className="hidden md:flex items-center px-5 py-2 bg-slate-900/40 border-b border-slate-800/50 text-[10px] text-slate-500 font-mono uppercase gap-4">
                        <div className="w-5 shrink-0" />
                        <div className="flex-1">Evidence Name</div>
                        <div className="w-40 shrink-0 hidden md:block">Frameworks</div>
                        <div className="w-40 shrink-0 hidden lg:block">Controls</div>
                        <div className="w-24 shrink-0" />
                    </div>

                    {filteredCatalog.map(item => (
                        <RequiredEvidenceRow
                            key={item.id}
                            item={item}
                            uploadedNames={uploadedNames}
                            onUpload={openUpload}
                        />
                    ))}
                </div>
            )}

            {/* ── Uploaded Artifacts ── */}
            {activeTab === "uploads" && (
                <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search uploaded artifacts…"
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
                        </div>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                            <option value="all">All Evidence</option>
                            <option value="stale">Stale (&gt;90 days)</option>
                            <option value="expiring">Expiring Soon</option>
                            <option value="expired">Expired</option>
                        </select>
                        <select value={filterControl} onChange={e => setFilterControl(e.target.value)}
                            className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                            <option value="all">All Controls</option>
                            {controls.map(c => <option key={c.id} value={c.id}>{c.control_id}</option>)}
                        </select>
                        <span className="text-xs text-slate-500 ml-auto">{filtered.length} artifact{filtered.length !== 1 ? "s" : ""}</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <FolderGit2 className="w-12 h-12 text-slate-700 mb-3" />
                            <p className="text-sm font-medium text-slate-400">No artifacts found</p>
                            <p className="text-xs text-slate-600 mt-1">Upload evidence using the catalog tab or the button above</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Evidence</th>
                                        <th className="px-4 py-3 font-medium">Control Fulfilled</th>
                                        <th className="px-4 py-3 font-medium">Uploaded By</th>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Expiry</th>
                                        <th className="px-4 py-3 font-medium">Size</th>
                                        <th className="px-4 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filtered.map(a => {
                                        const stale = isStale(a);
                                        const expiring = isExpiringSoon(a);
                                        const expired = isExpired(a);
                                        const ctrl = a.control_id ? controlMap.get(a.control_id) : null;
                                        return (
                                            <tr key={a.id} className="hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <FileIcon type={a.file_type} />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{a.name}</span>
                                                            {a.description && (
                                                                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">{a.description}</span>
                                                            )}
                                                            {stale && !expired && (
                                                                <span className="text-[10px] text-amber-400 flex items-center space-x-1 mt-0.5">
                                                                    <Clock className="w-3 h-3" /><span>Stale</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {ctrl ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-mono text-indigo-400">{ctrl.control_id}</span>
                                                            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{ctrl.title}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400">{a.uploader?.full_name ?? "Unknown"}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {a.expires_at ? (
                                                        <span className={cn("text-xs", expired ? "text-red-400 font-medium" : expiring ? "text-orange-400 font-medium" : "text-slate-400")}>
                                                            {expired && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                                            {expiring && !expired && <Clock className="w-3 h-3 inline mr-1" />}
                                                            {new Date(a.expires_at).toLocaleDateString()}
                                                        </span>
                                                    ) : <span className="text-xs text-slate-600">No expiry</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-500 font-mono">{formatBytes(a.file_size)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {a.file_url && (
                                                            <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                                                                className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button onClick={() => handleDelete(a.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <UploadModal
                        orgId={orgId}
                        currentUserId={currentUserId}
                        controls={controls}
                        prefillName={uploadPrefill}
                        onClose={() => { setShowUpload(false); setUploadPrefill(""); }}
                        onUploaded={handleUploaded}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
