"use client";

import React, { useState, useMemo, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock, Shield, Globe, Database, Monitor, Users, Settings,
    Activity, Cloud, AlertTriangle, FileText, Eye, Building2,
    Search, UploadCloud, CheckCircle2, XCircle, MinusCircle,
    Loader2, RefreshCw, ShieldAlert, Target, TrendingUp,
    ClipboardList, CircleDot, Ban, Layers, Paperclip, ListChecks,
    KeyRound, ScrollText, Server, HardDrive, GitBranch,
    UserCheck, Scale, LifeBuoy, ShieldCheck, Mail, Wifi, Bell,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GapType = "not_started" | "no_evidence" | "no_policy" | "has_finding";

export interface GapItem {
    controlId: string;
    controlRef: string;
    title: string;
    domain: string;
    category: string;
    frameworkId: string;
    frameworkName: string;
    status: string;
    evidenceCount: number;
    hasApprovedPolicy: boolean;
    activeFindings: { source: string; severity: string }[];
    gapTypes: GapType[];
}

export interface ControlItem {
    id: string;
    controlRef: string;
    title: string;
    domain: string;
    category: string;
    frameworkId: string;
    frameworkName: string;
    status: string;
    evidenceCount: number;
}

interface GapAssessmentClientProps {
    gaps: GapItem[];
    allControls: ControlItem[];
    orgId: string;
    totalControls: number;
    verifiedControls: number;
    complianceScore: number;
}

type ResponseType = "verified" | "not_started" | "in_progress" | "not_applicable";

// ─── Domain Icon Mapping ──────────────────────────────────────────────────────

function getDomainIcon(domain: string): LucideIcon {
    const d = domain.toLowerCase();
    if (d.includes("access") || d.includes("cc6") || d.includes("logical")) return Lock;
    if (d.includes("cloud") || d.includes("aws")) return Cloud;
    if (d.includes("network") || d.includes("infrastructure")) return Globe;
    if (d.includes("people") || d.includes("human resource") || d.includes("hr")) return Users;
    if (d.includes("data") || d.includes("c1") || d.includes("confidential")) return Database;
    if (d.includes("monitor") || d.includes("cc4") || d.includes("detect")) return Monitor;
    if (d.includes("change") || d.includes("cc8") || d.includes("configuration")) return Settings;
    if (d.includes("risk") || d.includes("cc9") || d.includes("vendor")) return Shield;
    if (d.includes("incident") || d.includes("cc7") || d.includes("response")) return AlertTriangle;
    if (d.includes("availab") || d.includes("a1") || d.includes("continuity")) return Activity;
    if (d.includes("privacy") || d.includes("personal")) return Eye;
    if (d.includes("organ") || d.includes("govern") || d.includes("cc1")) return Building2;
    if (d.includes("commun") || d.includes("cc2")) return FileText;
    if (d.includes("risk assess") || d.includes("cc3")) return Target;
    return FileText;
}

// ─── Per-Control Icon Mapping ─────────────────────────────────────────────────

function getControlIcon(category: string, title: string, domain: string): LucideIcon {
    const c = (category + " " + title).toLowerCase();
    // Authentication & credentials
    if (/authenticat|password|credential|mfa|multi.?factor|passphrase|secret/.test(c)) return KeyRound;
    // Encryption & key management
    if (/encrypt|cryptograph|key management|tls|ssl|cipher|certificate/.test(c)) return ShieldCheck;
    // User identity & IAM
    if (/identity|iam|user.?manag|privilege|role.?based|rbac|least.?privilege/.test(c)) return UserCheck;
    // Audit & logging
    if (/\blog\b|audit|trail|syslog|record|event log/.test(c)) return ScrollText;
    // Access control / permissions
    if (/access control|permission|authoriz|entitlement|segregation/.test(c)) return Lock;
    // Monitoring & alerting
    if (/monitor|alert|detect|siem|threshold|anomal|observ/.test(c)) return Monitor;
    // Incident & response
    if (/incident|response|forensic|breach|eradication|contain/.test(c)) return AlertTriangle;
    // Change & patch management
    if (/change management|patch|deploy|release|version control|software update/.test(c)) return GitBranch;
    // Backup & recovery
    if (/backup|recovery|restore|archiv|retention|snapshot/.test(c)) return HardDrive;
    // Network & firewall
    if (/network|firewall|vpc|segmentat|dmz|packet|port scanning/.test(c)) return Globe;
    // Wireless
    if (/wireless|wi.?fi|bluetooth|radio/.test(c)) return Wifi;
    // Server & infrastructure
    if (/server|infrastructure|compute|virtual|container|hardening/.test(c)) return Server;
    // Cloud services
    if (/cloud|s3|ec2|iam|lambda|azure|gcp/.test(c)) return Cloud;
    // Physical & facilities
    if (/physical|data center|facility|premise|badge|cctv|surveillance/.test(c)) return Building2;
    // Vendor & third party
    if (/vendor|third.?party|supplier|outsourc|contract|tprm/.test(c)) return Users;
    // Risk & vulnerability
    if (/vulnerab|threat|risk assess|pentest|scan|exploit/.test(c)) return Target;
    // Privacy & data protection
    if (/privac|personal data|gdpr|pii|data protection|consent/.test(c)) return Eye;
    // Legal & compliance
    if (/legal|regulat|compli|certif|standard|framework|audit right/.test(c)) return Scale;
    // Communication & notification
    if (/communicat|notif|disclosure|report|escalat/.test(c)) return Mail;
    // Business continuity
    if (/business continu|bcp|disaster|resilien|rto|rpo/.test(c)) return LifeBuoy;
    // Availability & capacity
    if (/availab|uptime|sla|capacity|redundan|failover/.test(c)) return Activity;
    // Configuration & baseline
    if (/config|hardening|baseline|parameter|setting|build standard/.test(c)) return Settings;
    // Notification / alarm
    if (/notif|alarm|bell|pager/.test(c)) return Bell;
    // Data & database
    if (/database|data classif|data integr|data qualit/.test(c)) return Database;
    // Security program / governance
    if (/govern|secur.?program|policy|procedure|standard|organization/.test(c)) return Shield;
    // Fall back to domain icon
    return getDomainIcon(domain);
}

function getControlIconStyle(category: string): { bg: string; icon: string } {
    const c = (category || "").toLowerCase();
    if (c.includes("access") || c.includes("authenticat") || c.includes("iam")) return { bg: "bg-blue-500/15 border-blue-500/25", icon: "text-blue-400" };
    if (c.includes("network") || c.includes("infra")) return { bg: "bg-purple-500/15 border-purple-500/25", icon: "text-purple-400" };
    if (c.includes("data") || c.includes("encrypt") || c.includes("privac")) return { bg: "bg-teal-500/15 border-teal-500/25", icon: "text-teal-400" };
    if (c.includes("monitor") || c.includes("detect") || c.includes("log")) return { bg: "bg-orange-500/15 border-orange-500/25", icon: "text-orange-400" };
    if (c.includes("change") || c.includes("config") || c.includes("patch")) return { bg: "bg-indigo-500/15 border-indigo-500/25", icon: "text-indigo-400" };
    if (c.includes("incident") || c.includes("response") || c.includes("vulnerab")) return { bg: "bg-red-500/15 border-red-500/25", icon: "text-red-400" };
    if (c.includes("availab") || c.includes("continu") || c.includes("backup")) return { bg: "bg-green-500/15 border-green-500/25", icon: "text-green-400" };
    if (c.includes("vendor") || c.includes("third") || c.includes("supplier")) return { bg: "bg-pink-500/15 border-pink-500/25", icon: "text-pink-400" };
    if (c.includes("risk") || c.includes("threat")) return { bg: "bg-amber-500/15 border-amber-500/25", icon: "text-amber-400" };
    if (c.includes("legal") || c.includes("compli") || c.includes("govern")) return { bg: "bg-cyan-500/15 border-cyan-500/25", icon: "text-cyan-400" };
    return { bg: "bg-slate-700/40 border-slate-600/30", icon: "text-slate-400" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryColor(category: string): string {
    const c = (category || "").toLowerCase();
    if (c.includes("access")) return "bg-blue-500/15 text-blue-300 border-blue-500/25";
    if (c.includes("network") || c.includes("infra")) return "bg-purple-500/15 text-purple-300 border-purple-500/25";
    if (c.includes("data") || c.includes("inform")) return "bg-teal-500/15 text-teal-300 border-teal-500/25";
    if (c.includes("monitor") || c.includes("detect")) return "bg-orange-500/15 text-orange-300 border-orange-500/25";
    if (c.includes("change") || c.includes("config")) return "bg-indigo-500/15 text-indigo-300 border-indigo-500/25";
    if (c.includes("incident") || c.includes("response")) return "bg-red-500/15 text-red-300 border-red-500/25";
    if (c.includes("availab") || c.includes("continu")) return "bg-green-500/15 text-green-300 border-green-500/25";
    if (c.includes("vendor") || c.includes("third")) return "bg-pink-500/15 text-pink-300 border-pink-500/25";
    if (c.includes("risk")) return "bg-amber-500/15 text-amber-300 border-amber-500/25";
    if (c.includes("privac") || c.includes("personal")) return "bg-cyan-500/15 text-cyan-300 border-cyan-500/25";
    return "bg-slate-500/15 text-slate-300 border-slate-500/25";
}

function responseStyle(key: ResponseType, active: boolean): string {
    if (!active) {
        return "border border-slate-700/50 text-slate-500 hover:border-slate-500/60 hover:text-slate-300 bg-slate-800/30";
    }
    const map: Record<ResponseType, string> = {
        verified: "border border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10",
        not_started: "border border-red-500/60 bg-red-500/20 text-red-300 shadow-sm shadow-red-500/10",
        in_progress: "border border-amber-500/60 bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-500/10",
        not_applicable: "border border-slate-500/60 bg-slate-500/20 text-slate-300",
    };
    return map[key];
}

const RESPONSES: { key: ResponseType; label: string; icon: React.ReactNode }[] = [
    { key: "verified",       label: "Yes",     icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: "not_started",    label: "No",      icon: <XCircle className="w-3.5 h-3.5" /> },
    { key: "in_progress",    label: "Partial", icon: <CircleDot className="w-3.5 h-3.5" /> },
    { key: "not_applicable", label: "N/A",     icon: <Ban className="w-3.5 h-3.5" /> },
];

// ─── Evidence Upload Modal ────────────────────────────────────────────────────

function EvidenceUploadModal({
    control, orgId, onClose, onDone,
}: {
    control: ControlItem; orgId: string; onClose: () => void; onDone: () => void;
}) {
    const [name, setName] = useState(`Evidence for ${control.controlRef}`);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError("Name required."); return; }
        setUploading(true); setError(null);

        let file_url: string | null = null;
        let file_type: string | null = null;
        let file_size: number | null = null;

        if (file) {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const ext = file.name.split(".").pop();
            const path = `${orgId}/${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("evidence-artifacts")
                .upload(path, file, { contentType: file.type });
            if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }
            const { data: urlData } = supabase.storage.from("evidence-artifacts").getPublicUrl(path);
            file_url = urlData.publicUrl;
            file_type = file.type;
            file_size = file.size;
        }

        const res = await fetch("/api/evidence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                org_id: orgId, name: name.trim(),
                control_id: control.id, file_url, file_type, file_size,
            }),
        });

        if (!res.ok) {
            const j = await res.json();
            setError(j.error ?? "Upload failed");
            setUploading(false);
            return;
        }
        toast.success("Evidence uploaded");
        onDone();
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">Upload Evidence</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{control.controlRef}: {control.title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Evidence Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">File (optional)</label>
                        <input
                            type="file"
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:text-xs cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                        >
                            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                            Upload
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({
    control, qNum, orgId, onStatusChange,
}: {
    control: ControlItem;
    qNum: number;
    orgId: string;
    onStatusChange: (id: string, status: string) => void;
}) {
    const [loading, setLoading] = useState<ResponseType | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [localEvidenceCount, setLocalEvidenceCount] = useState(control.evidenceCount);

    const handleResponse = async (response: ResponseType) => {
        if (control.status === response) return;
        const prevStatus = control.status;
        setLoading(response);

        // Optimistic update
        onStatusChange(control.id, response);

        const res = await fetch(`/api/controls/${control.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: response }),
        });

        if (!res.ok) {
            const j = await res.json();
            toast.error(j.error ?? "Failed to update");
            onStatusChange(control.id, prevStatus);
        } else {
            const labels: Record<ResponseType, string> = {
                verified: "Marked as Yes (Verified)",
                not_started: "Marked as No",
                in_progress: "Marked as Partial",
                not_applicable: "Marked as N/A",
            };
            toast.success(labels[response]);
        }
        setLoading(null);
    };

    const EVIDENCE_MAX = 5;
    const evidencePct = Math.min(100, (localEvidenceCount / EVIDENCE_MAX) * 100);
    const catColor = getCategoryColor(control.category);
    const ControlIcon = getControlIcon(control.category, control.title, control.domain);
    const iconStyle = getControlIconStyle(control.category);

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 hover:border-slate-700/60 transition-colors"
            >
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Icon badge with Q number */}
                    <div className={cn(
                        "shrink-0 w-10 h-10 flex flex-col items-center justify-center rounded-xl border mt-0.5 gap-px",
                        iconStyle.bg
                    )}>
                        <ControlIcon className={cn("w-4 h-4", iconStyle.icon)} />
                        <span className="text-[8px] font-bold text-slate-500 leading-none">Q{qNum}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono font-bold text-indigo-400">{control.controlRef}</span>
                            {control.category && (
                                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", catColor)}>
                                    {control.category}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-slate-600">
                                <Layers className="w-2.5 h-2.5" />{control.frameworkName}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200 leading-snug">{control.title}</p>
                    </div>
                </div>

                {/* Response buttons + evidence bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    {RESPONSES.map(r => (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => handleResponse(r.key)}
                            disabled={loading !== null}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                                responseStyle(r.key, control.status === r.key),
                                loading === r.key && "opacity-60"
                            )}
                        >
                            {loading === r.key
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : r.icon}
                            {r.label}
                        </button>
                    ))}

                    <div className="flex-1" />

                    {/* Evidence */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5">
                            <Paperclip className="w-3 h-3 text-slate-600 shrink-0" />
                            <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                    style={{ width: `${evidencePct}%` }}
                                />
                            </div>
                            <span className="text-[11px] text-slate-500 w-4">{localEvidenceCount}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUpload(true)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/40 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <UploadCloud className="w-3 h-3" />
                            Upload
                        </button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showUpload && (
                    <EvidenceUploadModal
                        control={control}
                        orgId={orgId}
                        onClose={() => setShowUpload(false)}
                        onDone={() => setLocalEvidenceCount(n => n + 1)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function GapAssessmentClient({
    gaps,
    allControls: initialControls,
    orgId,
    totalControls,
    verifiedControls,
    complianceScore,
}: GapAssessmentClientProps) {
    const router = useRouter();
    const [controls, setControls] = useState<ControlItem[]>(initialControls ?? []);
    const [activeDomain, setActiveDomain] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const [syncing, setSyncing] = useState(false);

    const refresh = () => startTransition(() => { router.refresh(); });

    // Optimistic status update
    const handleStatusChange = useCallback((id: string, status: string) => {
        setControls(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    }, []);

    // Domain tabs with stats
    const domains = useMemo(() => {
        const map = new Map<string, { total: number; verified: number; inProgress: number; notApplicable: number }>();
        for (const c of controls) {
            const d = c.domain || "General";
            const prev = map.get(d) ?? { total: 0, verified: 0, inProgress: 0, notApplicable: 0 };
            map.set(d, {
                total: prev.total + 1,
                verified: prev.verified + (c.status === "verified" ? 1 : 0),
                inProgress: prev.inProgress + (c.status === "in_progress" ? 1 : 0),
                notApplicable: prev.notApplicable + (c.status === "not_applicable" ? 1 : 0),
            });
        }
        return Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, s]) => ({
                name,
                total: s.total,
                verified: s.verified,
                inProgress: s.inProgress,
                notApplicable: s.notApplicable,
                // Score excludes N/A from denominator
                score: (s.total - s.notApplicable) > 0
                    ? Math.round((s.verified / (s.total - s.notApplicable)) * 100)
                    : 100,
                Icon: getDomainIcon(name),
            }));
    }, [controls]);

    const currentDomain = activeDomain ?? (domains[0]?.name ?? null);
    const currentDomainData = domains.find(d => d.name === currentDomain);

    // Controls visible in current domain + search
    const visibleControls = useMemo(() => {
        let result = controls.filter(c => (c.domain || "General") === currentDomain);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.controlRef.toLowerCase().includes(q) ||
                (c.category || "").toLowerCase().includes(q)
            );
        }
        return result;
    }, [controls, currentDomain, search]);

    // Overall stats
    const stats = useMemo(() => {
        const yes = controls.filter(c => c.status === "verified").length;
        const partial = controls.filter(c => c.status === "in_progress").length;
        const na = controls.filter(c => c.status === "not_applicable").length;
        const no = controls.filter(c => c.status === "not_started").length;
        const assessed = yes + partial + na;
        const eligible = controls.length - na;
        const score = eligible > 0 ? Math.round((yes / eligible) * 100) : 100;
        return { yes, partial, na, no, assessed, total: controls.length, score };
    }, [controls]);

    const handleSyncRisks = async () => {
        setSyncing(true);
        const res = await fetch("/api/risks/sync-from-gaps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const j = await res.json();
        if (res.ok) toast.success(`${j.created} risks synced · ${j.skipped} already existed`);
        else toast.error(j.error ?? "Sync failed");
        setSyncing(false);
    };

    return (
        <div className="w-full flex flex-col space-y-5 animate-in fade-in duration-700">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                            <ListChecks className="w-5 h-5 text-indigo-400" />
                        </div>
                        Gap Assessment
                    </h1>
                    <p className="text-sm text-slate-400 mt-1.5 ml-0.5">
                        Review and respond to all compliance controls across your assigned frameworks
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={isPending}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={handleSyncRisks}
                        disabled={syncing}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                        Sync Risks
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Overall Score */}
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 col-span-1">
                    <div className="flex items-start justify-between mb-1">
                        <p className={cn(
                            "text-3xl font-bold",
                            stats.score >= 70 ? "text-emerald-400" : stats.score >= 40 ? "text-amber-400" : "text-red-400"
                        )}>
                            {stats.score}%
                        </p>
                        <TrendingUp className={cn(
                            "w-4 h-4 mt-1.5",
                            stats.score >= 70 ? "text-emerald-500" : stats.score >= 40 ? "text-amber-500" : "text-red-500"
                        )} />
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Overall Score</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Verified controls</p>
                    <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-700",
                                stats.score >= 70 ? "bg-emerald-500" : stats.score >= 40 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${stats.score}%` }}
                        />
                    </div>
                </div>

                {/* Assessed */}
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-3xl font-bold text-slate-200">{stats.assessed}<span className="text-lg text-slate-500">/{stats.total}</span></p>
                        <ClipboardList className="w-4 h-4 text-slate-500 mt-1.5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Assessed</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Controls responded</p>
                </div>

                {/* Yes */}
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-3xl font-bold text-emerald-400">{stats.yes}</p>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1.5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Yes</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Fully verified</p>
                </div>

                {/* Partial */}
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-3xl font-bold text-amber-400">{stats.partial}</p>
                        <CircleDot className="w-4 h-4 text-amber-600 mt-1.5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Partial</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">In progress</p>
                </div>

                {/* No */}
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-3xl font-bold text-red-400">{stats.no}</p>
                        <XCircle className="w-4 h-4 text-red-600 mt-1.5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300">No</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Not started</p>
                </div>
            </div>

            {/* ── Domain Tabs ── */}
            <div className="overflow-x-auto -mx-1 px-1 pb-1">
                <div className="flex gap-2 min-w-max">
                    {domains.map(d => {
                        const Icon = d.Icon;
                        const isActive = d.name === currentDomain;
                        return (
                            <button
                                key={d.name}
                                type="button"
                                onClick={() => { setActiveDomain(d.name); setSearch(""); }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border whitespace-nowrap",
                                    isActive
                                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                                        : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-600/50"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-400" : "text-slate-500")} />
                                <span className="max-w-[160px] truncate">{d.name}</span>
                                <span className={cn(
                                    "text-[11px] font-bold px-1.5 py-0.5 rounded-md ml-0.5",
                                    d.score >= 70
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : d.score >= 40
                                            ? "bg-amber-500/15 text-amber-400"
                                            : "bg-red-500/15 text-red-400"
                                )}>
                                    {d.score}%
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Domain Header ── */}
            {currentDomainData && (
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                                <currentDomainData.Icon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-100">{currentDomainData.name}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {currentDomainData.verified} verified &middot;&nbsp;
                                    {currentDomainData.inProgress} in progress &middot;&nbsp;
                                    {currentDomainData.total} total controls
                                </p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <span className={cn(
                                "text-2xl font-bold",
                                currentDomainData.score >= 70 ? "text-emerald-400" :
                                currentDomainData.score >= 40 ? "text-amber-400" : "text-red-400"
                            )}>
                                {currentDomainData.score}%
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">compliance</p>
                        </div>
                    </div>
                    <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-700",
                                currentDomainData.score >= 70 ? "bg-emerald-500" :
                                currentDomainData.score >= 40 ? "bg-amber-500" : "bg-indigo-500"
                            )}
                            style={{ width: `${currentDomainData.score}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ── Search ── */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search questions, control ref, category…"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
            </div>

            {/* ── Question Cards ── */}
            {visibleControls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-slate-800/50 rounded-2xl">
                    <CheckCircle2 className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-slate-400 text-sm font-medium">No controls found</p>
                    <p className="text-slate-600 text-xs mt-1">Try a different domain or clear the search</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[11px] text-slate-600 uppercase tracking-wider font-semibold px-1">
                        {visibleControls.length} question{visibleControls.length !== 1 ? "s" : ""}
                    </p>
                    {visibleControls.map((control, idx) => (
                        <QuestionCard
                            key={control.id}
                            control={control}
                            qNum={idx + 1}
                            orgId={orgId}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
