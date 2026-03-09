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
    ChevronRight, BarChart3, ArrowRight,
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
    if (d.includes("consent")) return FileText;
    if (d.includes("data principal") || d.includes("rights")) return UserCheck;
    if (d.includes("children")) return Shield;
    if (d.includes("cross-border") || d.includes("transfer")) return Globe;
    if (d.includes("significant")) return Target;
    if (d.includes("governance") || d.includes("govern")) return Building2;
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
    if (d.includes("organ") || d.includes("cc1")) return Building2;
    if (d.includes("commun") || d.includes("cc2")) return FileText;
    if (d.includes("risk assess") || d.includes("cc3")) return Target;
    if (d.includes("organizational")) return Building2;
    if (d.includes("physical")) return Server;
    if (d.includes("technological")) return HardDrive;
    return FileText;
}

// ─── Per-Control Icon Mapping ─────────────────────────────────────────────────

function getControlIcon(category: string, title: string, domain: string): LucideIcon {
    const c = (category + " " + title).toLowerCase();
    if (/authenticat|password|credential|mfa|multi.?factor|passphrase|secret/.test(c)) return KeyRound;
    if (/encrypt|cryptograph|key management|tls|ssl|cipher|certificate/.test(c)) return ShieldCheck;
    if (/identity|iam|user.?manag|privilege|role.?based|rbac|least.?privilege/.test(c)) return UserCheck;
    if (/\blog\b|audit|trail|syslog|record|event log/.test(c)) return ScrollText;
    if (/access control|permission|authoriz|entitlement|segregation/.test(c)) return Lock;
    if (/monitor|alert|detect|siem|threshold|anomal|observ/.test(c)) return Monitor;
    if (/incident|response|forensic|breach|eradication|contain/.test(c)) return AlertTriangle;
    if (/change management|patch|deploy|release|version control|software update/.test(c)) return GitBranch;
    if (/backup|recovery|restore|archiv|retention|snapshot/.test(c)) return HardDrive;
    if (/network|firewall|vpc|segmentat|dmz|packet|port scanning/.test(c)) return Globe;
    if (/wireless|wi.?fi|bluetooth|radio/.test(c)) return Wifi;
    if (/server|infrastructure|compute|virtual|container|hardening/.test(c)) return Server;
    if (/cloud|s3|ec2|iam|lambda|azure|gcp/.test(c)) return Cloud;
    if (/physical|data center|facility|premise|badge|cctv|surveillance/.test(c)) return Building2;
    if (/vendor|third.?party|supplier|outsourc|contract|tprm/.test(c)) return Users;
    if (/vulnerab|threat|risk assess|pentest|scan|exploit/.test(c)) return Target;
    if (/privac|personal data|gdpr|pii|data protection|consent/.test(c)) return Eye;
    if (/legal|regulat|compli|certif|standard|framework|audit right/.test(c)) return Scale;
    if (/communicat|notif|disclosure|report|escalat/.test(c)) return Mail;
    if (/business continu|bcp|disaster|resilien|rto|rpo/.test(c)) return LifeBuoy;
    if (/availab|uptime|sla|capacity|redundan|failover/.test(c)) return Activity;
    if (/config|hardening|baseline|parameter|setting|build standard/.test(c)) return Settings;
    if (/notif|alarm|bell|pager/.test(c)) return Bell;
    if (/database|data classif|data integr|data qualit/.test(c)) return Database;
    if (/govern|secur.?program|policy|procedure|standard|organization/.test(c)) return Shield;
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
    if (c.includes("consent") || c.includes("s.6") || c.includes("s.7")) return { bg: "bg-violet-500/15 border-violet-500/25", icon: "text-violet-400" };
    if (c.includes("children") || c.includes("s.9")) return { bg: "bg-pink-500/15 border-pink-500/25", icon: "text-pink-400" };
    return { bg: "bg-slate-700/40 border-slate-600/30", icon: "text-slate-400" };
}

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
    if (c.includes("privac") || c.includes("personal") || c.includes("consent")) return "bg-violet-500/15 text-violet-300 border-violet-500/25";
    if (c.includes("s.")) return "bg-orange-500/15 text-orange-300 border-orange-500/25";
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

// ─── Framework color palettes ─────────────────────────────────────────────────
const FW_PALETTE: Record<string, { accent: string; ring: string; bg: string; border: string; text: string; pill: string }> = {
    "SOC 2 Type II": {
        accent: "#f97316", ring: "#f97316", bg: "bg-orange-500/10", border: "border-orange-500/25",
        text: "text-orange-400", pill: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    },
    "ISO 27001": {
        accent: "#6366f1", ring: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/25",
        text: "text-indigo-400", pill: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    },
    "NIST CSF": {
        accent: "#3b82f6", ring: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/25",
        text: "text-blue-400", pill: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    },
    "DPDPA": {
        accent: "#8b5cf6", ring: "#8b5cf6", bg: "bg-violet-500/10", border: "border-violet-500/25",
        text: "text-violet-400", pill: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    },
};

function getFwPalette(name: string) {
    const key = Object.keys(FW_PALETTE).find(k => name.startsWith(k)) ?? "";
    return FW_PALETTE[key] ?? {
        accent: "#64748b", ring: "#64748b", bg: "bg-slate-500/10", border: "border-slate-500/25",
        text: "text-slate-400", pill: "bg-slate-500/15 text-slate-300 border-slate-500/25",
    };
}

// ─── SVG Donut ────────────────────────────────────────────────────────────────
function ScoreDonut({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
    const r = size * 0.38;
    const circ = 2 * Math.PI * r;
    const cx = size / 2;
    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e293b" strokeWidth={size * 0.1} />
                <motion.circle
                    cx={cx} cy={cx} r={r} fill="none"
                    stroke={color} strokeWidth={size * 0.1} strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - score / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    transform={`rotate(-90 ${cx} ${cx})`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-slate-100 leading-none" style={{ fontSize: size * 0.2 }}>{score}%</span>
            </div>
        </div>
    );
}

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

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors";

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
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
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
    control, qNum, orgId, onStatusChange, fwPalette,
}: {
    control: ControlItem;
    qNum: number;
    orgId: string;
    onStatusChange: (id: string, status: string) => void;
    fwPalette: ReturnType<typeof getFwPalette>;
}) {
    const [loading, setLoading] = useState<ResponseType | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [localEvidenceCount, setLocalEvidenceCount] = useState(control.evidenceCount);

    const handleResponse = async (response: ResponseType) => {
        if (control.status === response) return;
        const prevStatus = control.status;
        setLoading(response);
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
                <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                        "shrink-0 w-10 h-10 flex flex-col items-center justify-center rounded-xl border mt-0.5 gap-px",
                        iconStyle.bg
                    )}>
                        <ControlIcon className={cn("w-4 h-4", iconStyle.icon)} />
                        <span className="text-[8px] font-bold text-slate-500 leading-none">Q{qNum}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={cn("text-xs font-mono font-bold", fwPalette.text)}>{control.controlRef}</span>
                            {control.category && (
                                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", catColor)}>
                                    {control.category}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-200 leading-snug">{control.title}</p>
                    </div>

                    {/* Status indicator */}
                    <div className="shrink-0">
                        {control.status === "verified" && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">Verified</span>}
                        {control.status === "in_progress" && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">Partial</span>}
                        {control.status === "not_started" && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full">Open</span>}
                        {control.status === "not_applicable" && <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/25 px-2 py-0.5 rounded-full">N/A</span>}
                    </div>
                </div>

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

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5">
                            <Paperclip className="w-3 h-3 text-slate-600 shrink-0" />
                            <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${evidencePct}%` }} />
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

// ─── Compliance Engine Visualization ─────────────────────────────────────────

const VW = 1100;
const VH = 720;

interface BubblePos { x: number; y: number; }

function getFwPositions(count: number): BubblePos[] {
    const cx = VW / 2;
    if (count === 0) return [];
    if (count === 1) return [{ x: cx, y: 240 }];
    if (count === 2) return [{ x: cx - 200, y: 260 }, { x: cx + 200, y: 260 }];
    if (count === 3) return [
        { x: cx - 300, y: 360 }, { x: cx, y: 260 }, { x: cx + 300, y: 360 },
    ];
    return [
        { x: 165, y: 330 }, { x: 390, y: 220 },
        { x: 710, y: 220 }, { x: 935, y: 330 },
    ];
}

function getDomainPositions(fwPos: BubblePos, count: number): BubblePos[] {
    if (count === 0) return [];
    const n = Math.min(count, 9);
    const r = 200;
    return Array.from({ length: n }, (_, i) => {
        const t = n === 1 ? 0.5 : i / (n - 1);
        const start = -Math.PI * 5 / 6;  // -150 deg (upper-left)
        const end = -Math.PI / 6;         // -30 deg  (upper-right)
        const angle = start + t * (end - start);
        return { x: fwPos.x + Math.cos(angle) * r, y: fwPos.y + Math.sin(angle) * r };
    });
}

interface EngineVizProps {
    frameworks: Array<{ id: string; name: string; score: number; palette: ReturnType<typeof getFwPalette> }>;
    selectedFwId: string | null;
    onSelectFw: (id: string) => void;
    domains: Array<{ name: string; score: number }>;
    selectedDomain: string | null;
    onSelectDomain: (name: string) => void;
    overallScore: number;
}

function ComplianceEngineViz({
    frameworks, selectedFwId, onSelectFw,
    domains, selectedDomain, onSelectDomain,
    overallScore,
}: EngineVizProps) {
    const enginePos: BubblePos = { x: VW / 2, y: 610 };
    const fwPositions = getFwPositions(frameworks.length);
    const selIdx = frameworks.findIndex(f => f.id === selectedFwId);
    const selFwPos = selIdx >= 0 ? fwPositions[selIdx] : null;
    const domainPositions = selFwPos ? getDomainPositions(selFwPos, domains.length) : [];
    const engineR = 66;
    const engineCirc = 2 * Math.PI * engineR;

    return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800/60" style={{ height: 720, background: '#020617' }}>

            {/* Bokeh background glows */}
            <div className="absolute pointer-events-none" style={{ width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.10), transparent 70%)', top: '0%', left: '15%' }} />
            <div className="absolute pointer-events-none" style={{ width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.09), transparent 70%)', top: '8%', right: '10%' }} />
            <div className="absolute pointer-events-none" style={{ width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)', bottom: '-8%', left: '50%', transform: 'translateX(-50%)' }} />

            {/* Title */}
            <div className="absolute top-3 left-4 pointer-events-none">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Compliance Engine</p>
                <p className="text-[9px] text-slate-700 mt-0.5">Click a framework to explore</p>
            </div>

            {/* Legend */}
            <div className="absolute top-3 right-4 flex flex-col gap-1 pointer-events-none">
                {frameworks.map(fw => (
                    <div key={fw.id} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: fw.palette.accent }} />
                        <span className="text-[9px] text-slate-500 font-mono">
                            {fw.name.replace(' Type II', '').replace(':2022', '').replace(':2023', '').replace(' 2.0', '')}
                        </span>
                    </div>
                ))}
            </div>

            {/* SVG layer for dashed lines */}
            <svg
                viewBox={`0 0 ${VW} ${VH}`}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
                preserveAspectRatio="none"
            >
                {/* Engine → Framework lines */}
                {fwPositions.map((fwPos, i) => (
                    <line
                        key={`ef-${i}`}
                        x1={enginePos.x} y1={enginePos.y}
                        x2={fwPos.x} y2={fwPos.y}
                        stroke={frameworks[i]?.palette.accent ?? '#475569'}
                        strokeWidth="1.5" strokeDasharray="5 5" opacity="0.25"
                    />
                ))}
                {/* Selected Fw → Domain lines */}
                {selFwPos && domainPositions.map((dp, i) => (
                    <line
                        key={`fd-${i}`}
                        x1={selFwPos.x} y1={selFwPos.y}
                        x2={dp.x} y2={dp.y}
                        stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"
                    />
                ))}
            </svg>

            {/* Framework Bubbles */}
            {frameworks.map((fw, i) => {
                const pos = fwPositions[i];
                if (!pos) return null;
                const isSel = fw.id === selectedFwId;
                const pal = fw.palette;
                const dr = 22, dcirc = 2 * Math.PI * dr;
                const label = fw.name
                    .replace(' Type II', '').replace(':2022', '').replace(':2023', '')
                    .replace(' 2.0', '');
                return (
                    <button
                        key={fw.id}
                        type="button"
                        onClick={() => onSelectFw(fw.id)}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${(pos.x / VW) * 100}%`, top: `${(pos.y / VH) * 100}%`, zIndex: 10 }}
                    >
                        <div
                            className="relative flex flex-col items-center justify-center rounded-full transition-all duration-300"
                            style={{
                                width: 138, height: 138,
                                background: isSel ? `${pal.accent}1c` : 'rgba(15,23,42,0.88)',
                                border: `2.5px solid ${isSel ? pal.accent : '#334155'}`,
                                boxShadow: isSel
                                    ? `0 0 40px ${pal.accent}55, 0 0 80px ${pal.accent}20, inset 0 0 24px ${pal.accent}10`
                                    : '0 6px 30px rgba(0,0,0,0.6)',
                            }}
                        >
                            <svg width="60" height="60" viewBox="0 0 56 56">
                                <circle cx="28" cy="28" r={dr} fill="none" stroke="#1e293b" strokeWidth="6" />
                                <motion.circle
                                    cx="28" cy="28" r={dr} fill="none"
                                    stroke={pal.accent} strokeWidth="6" strokeLinecap="round"
                                    strokeDasharray={dcirc}
                                    initial={{ strokeDashoffset: dcirc }}
                                    animate={{ strokeDashoffset: dcirc * (1 - fw.score / 100) }}
                                    transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.1 }}
                                    transform="rotate(-90 28 28)"
                                />
                                <text x="28" y="28" textAnchor="middle" dominantBaseline="central"
                                    style={{ fontSize: '11px', fontWeight: 800, fill: '#f1f5f9' }}>
                                    {fw.score}%
                                </text>
                            </svg>
                            <span className="text-[11px] font-bold text-center leading-tight px-2 text-slate-200 mt-1" style={{ maxWidth: 116 }}>
                                {label}
                            </span>
                        </div>
                    </button>
                );
            })}

            {/* Domain Bubbles */}
            <AnimatePresence>
                {selFwPos && domains.slice(0, 7).map((d, i) => {
                    const pos = domainPositions[i];
                    if (!pos) return null;
                    const isAct = d.name === selectedDomain;
                    const sc = d.score >= 70 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#ef4444';
                    const dr2 = 15, dcirc2 = 2 * Math.PI * dr2;
                    return (
                        <motion.button
                            key={d.name}
                            type="button"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            onClick={() => onSelectDomain(d.name)}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${(pos.x / VW) * 100}%`, top: `${(pos.y / VH) * 100}%`, zIndex: 10 }}
                        >
                            <div
                                className="relative flex flex-col items-center justify-center rounded-full transition-all duration-200"
                                style={{
                                    width: 94, height: 94,
                                    background: isAct ? 'rgba(30,41,59,0.97)' : 'rgba(15,23,42,0.83)',
                                    border: `1.5px solid ${isAct ? '#94a3b8' : '#334155'}`,
                                    boxShadow: isAct ? `0 0 20px rgba(148,163,184,0.30)` : '0 3px 16px rgba(0,0,0,0.55)',
                                }}
                            >
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r={dr2} fill="none" stroke="#1e293b" strokeWidth="4.5" />
                                    <motion.circle
                                        cx="20" cy="20" r={dr2} fill="none"
                                        stroke={sc} strokeWidth="4.5" strokeLinecap="round"
                                        strokeDasharray={dcirc2}
                                        initial={{ strokeDashoffset: dcirc2 }}
                                        animate={{ strokeDashoffset: dcirc2 * (1 - d.score / 100) }}
                                        transition={{ duration: 1.0, ease: 'easeOut', delay: i * 0.08 }}
                                        transform="rotate(-90 20 20)"
                                    />
                                    <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
                                        style={{ fontSize: '8.5px', fontWeight: 800, fill: '#f1f5f9' }}>
                                        {d.score}%
                                    </text>
                                </svg>
                                <span className="text-[9px] font-semibold text-slate-300 text-center leading-tight px-2 mt-0.5" style={{ maxWidth: 82 }}>
                                    {d.name.length > 12 ? d.name.slice(0, 11) + '…' : d.name}
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </AnimatePresence>

            {/* Engine Ring */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(enginePos.x / VW) * 100}%`, top: `${(enginePos.y / VH) * 100}%`, zIndex: 10 }}
            >
                <div className="relative flex items-center justify-center" style={{ width: 176, height: 176 }}>
                    {/* Orange glow layers */}
                    <div className="absolute rounded-full" style={{ inset: -20, background: 'radial-gradient(circle, rgba(249,115,22,0.12) 40%, transparent 70%)' }} />
                    <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.22) 25%, transparent 65%)' }} />
                    {/* Spinning dashed outer ring */}
                    <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0">
                        <motion.circle
                            cx="88" cy="88" r="83"
                            fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="10 6" opacity="0.45"
                            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                        />
                    </svg>
                    {/* Score donut */}
                    <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0">
                        <circle cx="88" cy="88" r={engineR} fill="none" stroke="#0f172a" strokeWidth="16" />
                        <motion.circle
                            cx="88" cy="88" r={engineR} fill="none"
                            stroke="#f97316" strokeWidth="16" strokeLinecap="round"
                            strokeDasharray={engineCirc}
                            initial={{ strokeDashoffset: engineCirc }}
                            animate={{ strokeDashoffset: engineCirc * (1 - overallScore / 100) }}
                            transition={{ duration: 1.8, ease: 'easeOut' }}
                            transform="rotate(-90 88 88)"
                        />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span className="text-[9px] font-bold tracking-[0.2em] text-orange-400 uppercase">Engine</span>
                        <span className="text-3xl font-bold text-slate-100 leading-none">{overallScore}%</span>
                        <span className="text-[9px] text-slate-500 tracking-wide">overall score</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Static domain lists for supplemental (non-DB) frameworks ────────────────
const STATIC_FW_DOMAINS: Record<string, Array<{ name: string; score: number }>> = {
    "ISO 27001": [
        { name: "Organizational",  score: 42 },
        { name: "People",          score: 35 },
        { name: "Physical",        score: 28 },
        { name: "Technological",   score: 48 },
    ],
    "SOC 2": [
        { name: "Security",             score: 22 },
        { name: "Availability",         score: 40 },
        { name: "Confidentiality",      score: 28 },
        { name: "Processing Integrity", score: 20 },
        { name: "Privacy",              score: 18 },
    ],
    "DPDPA": [
        { name: "Consent",         score: 8  },
        { name: "Data Rights",     score: 5  },
        { name: "Obligations",     score: 12 },
        { name: "Governance",      score: 15 },
    ],
};

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
    const [activeFrameworkId, setActiveFrameworkId] = useState<string | null>(null);
    const [activeDomain, setActiveDomain] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const refresh = () => startTransition(() => { router.refresh(); });

    // ── Group controls by framework (real DB data) ────────────────────────────
    const frameworks = useMemo(() => {
        const map = new Map<string, { id: string; name: string; controls: ControlItem[] }>();
        for (const c of controls) {
            if (!map.has(c.frameworkId)) {
                map.set(c.frameworkId, { id: c.frameworkId, name: c.frameworkName, controls: [] });
            }
            map.get(c.frameworkId)!.controls.push(c);
        }
        return Array.from(map.values()).map(fw => {
            const yes = fw.controls.filter(c => c.status === "verified").length;
            const partial = fw.controls.filter(c => c.status === "in_progress").length;
            const na = fw.controls.filter(c => c.status === "not_applicable").length;
            const no = fw.controls.filter(c => c.status === "not_started").length;
            const eligible = fw.controls.length - na;
            const score = eligible > 0 ? Math.round((yes / eligible) * 100) : 100;
            return { ...fw, yes, partial, na, no, score, palette: getFwPalette(fw.name) };
        });
    }, [controls]);

    // ── Always show all 4 frameworks — supplement with demo entries if not in DB ──
    const vizFrameworks = useMemo(() => {
        const REQUIRED = [
            { match: "ISO 27001", name: "ISO 27001:2022", score: 38 },
            { match: "SOC 2",     name: "SOC 2 Type II",  score: 22 },
            { match: "DPDPA",     name: "DPDPA 2023",     score: 8  },
        ];
        const extras = REQUIRED
            .filter(r => !frameworks.some(f => f.name.includes(r.match)))
            .map(r => ({
                id: `static-${r.name}`,
                name: r.name,
                controls: [] as ControlItem[],
                yes: 0, partial: 0, na: 0, no: 0,
                score: r.score,
                palette: getFwPalette(r.name),
            }));
        return [...frameworks, ...extras];
    }, [frameworks]);

    // Select default framework (prefer real data first)
    const currentFwId = activeFrameworkId ?? vizFrameworks[0]?.id ?? null;
    const currentFw = frameworks.find(f => f.id === currentFwId); // only real fw has domains

    // ── Domains for selected framework (real DB or static fallback) ───────────
    const domains = useMemo(() => {
        if (currentFw) {
            // Real DB controls → compute domain scores
            const map = new Map<string, { total: number; verified: number; notApplicable: number }>();
            for (const c of currentFw.controls) {
                const d = c.domain || "General";
                const prev = map.get(d) ?? { total: 0, verified: 0, notApplicable: 0 };
                map.set(d, {
                    total: prev.total + 1,
                    verified: prev.verified + (c.status === "verified" ? 1 : 0),
                    notApplicable: prev.notApplicable + (c.status === "not_applicable" ? 1 : 0),
                });
            }
            return Array.from(map.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([name, s]) => ({
                    name,
                    score: (s.total - s.notApplicable) > 0
                        ? Math.round((s.verified / (s.total - s.notApplicable)) * 100)
                        : 100,
                }));
        }
        // Static framework selected — look up hardcoded domain list by first-word prefix
        const vizFw = vizFrameworks.find(f => f.id === currentFwId);
        if (!vizFw) return [];
        const key = Object.keys(STATIC_FW_DOMAINS).find(k => vizFw.name.startsWith(k));
        return key ? STATIC_FW_DOMAINS[key] : [];
    }, [currentFw, currentFwId, vizFrameworks]);

    const currentDomain = activeDomain ?? (domains[0]?.name ?? null);

    // ── Overall score (real DB or demo average) ───────────────────────────────
    const overallScore = useMemo(() => {
        if (controls.length > 0) {
            const yes = controls.filter(c => c.status === "verified").length;
            const na = controls.filter(c => c.status === "not_applicable").length;
            const eligible = controls.length - na;
            return eligible > 0 ? Math.round((yes / eligible) * 100) : 0;
        }
        // Demo fallback: weighted average of all viz framework scores
        if (vizFrameworks.length === 0) return 0;
        return Math.round(vizFrameworks.reduce((s, f) => s + f.score, 0) / vizFrameworks.length);
    }, [controls, vizFrameworks]);

    return (
        <div className="w-full flex flex-col space-y-4 animate-in fade-in duration-700">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Compliance Readiness</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Track your compliance posture across frameworks
                    </p>
                </div>
                <button
                    type="button"
                    onClick={refresh}
                    disabled={isPending}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 shrink-0"
                >
                    <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                    Refresh
                </button>
            </div>

            {/* ── Compliance Engine (full height) ── */}
            <ComplianceEngineViz
                frameworks={vizFrameworks}
                selectedFwId={currentFwId}
                onSelectFw={(id) => { setActiveFrameworkId(id); setActiveDomain(null); }}
                domains={domains}
                selectedDomain={currentDomain}
                onSelectDomain={(name) => setActiveDomain(name)}
                overallScore={overallScore}
            />
        </div>
    );
}
