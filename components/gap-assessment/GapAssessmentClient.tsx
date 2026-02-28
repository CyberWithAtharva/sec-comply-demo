"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle, CheckCircle2, XCircle, Search, ChevronDown, ChevronRight,
    UploadCloud, Link2, ShieldAlert, MinusCircle, RefreshCw, Loader2,
    FileText, Zap, EyeOff, TrendingUp, Filter
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

interface GapAssessmentClientProps {
    gaps: GapItem[];
    orgId: string;
    totalControls: number;
    verifiedControls: number;
    complianceScore: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP_LABELS: Record<GapType, { label: string; color: string; icon: React.ReactNode }> = {
    has_finding:  { label: "Active Finding", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: <Zap className="w-3 h-3" /> },
    no_evidence:  { label: "No Evidence", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: <UploadCloud className="w-3 h-3" /> },
    no_policy:    { label: "No Policy", color: "text-sky-400 bg-sky-500/10 border-sky-500/30", icon: <FileText className="w-3 h-3" /> },
    not_started:  { label: "Not Started", color: "text-slate-400 bg-slate-500/10 border-slate-500/30", icon: <EyeOff className="w-3 h-3" /> },
};

const STATUS_COLORS: Record<string, string> = {
    not_started: "text-slate-400",
    in_progress: "text-amber-400",
    verified:    "text-emerald-400",
    not_applicable: "text-slate-500",
};

// ─── Evidence Upload Quick-Action Modal ───────────────────────────────────────

function EvidenceUploadModal({ gap, orgId, onClose, onDone }: {
    gap: GapItem; orgId: string; onClose: () => void; onDone: () => void;
}) {
    const [name, setName] = useState(`Evidence for ${gap.controlRef}`);
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
            // Upload to Supabase Storage via browser client
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
            body: JSON.stringify({ org_id: orgId, name: name.trim(), control_id: gap.controlId, file_url, file_type, file_size }),
        });

        if (!res.ok) { const j = await res.json(); setError(j.error ?? "Upload failed"); setUploading(false); return; }
        toast.success("Evidence uploaded — control status updated");
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
                        <p className="text-xs text-slate-500 mt-0.5">For {gap.controlRef}: {gap.title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Evidence Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">File (optional)</label>
                        <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:text-xs cursor-pointer" />
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
                        <button type="submit" disabled={uploading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
                            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                            Upload
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Gap Row ──────────────────────────────────────────────────────────────────

function GapRow({ gap, orgId, onAction }: { gap: GapItem; orgId: string; onAction: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleMarkNA = async () => {
        setActionLoading("na");
        const res = await fetch(`/api/controls/${gap.controlId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "not_applicable" }),
        });
        if (res.ok) { toast.success("Control marked as N/A"); onAction(); }
        else { const j = await res.json(); toast.error(j.error ?? "Failed"); }
        setActionLoading(null);
    };

    const handleCreateRisk = async () => {
        setActionLoading("risk");
        const res = await fetch("/api/risks/sync-from-gaps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ control_ids: [gap.controlId] }),
        });
        const j = await res.json();
        if (res.ok) {
            toast.success(j.created > 0 ? "Risk created in Risk Register" : "Risk already exists in Risk Register");
            router.refresh();
        } else {
            toast.error(j.error ?? "Failed to create risk");
        }
        setActionLoading(null);
    };

    const highestFindingSeverity = gap.activeFindings.reduce((acc, f) => {
        const order = ["critical", "high", "medium", "low"];
        return order.indexOf(f.severity) < order.indexOf(acc) ? f.severity : acc;
    }, "low");

    return (
        <>
            <div
                className={cn(
                    "border border-slate-800/60 rounded-xl overflow-hidden transition-colors",
                    expanded ? "bg-slate-800/30" : "bg-slate-900/40 hover:bg-slate-800/20"
                )}
            >
                <button
                    type="button"
                    className="w-full flex items-start gap-3 p-4 text-left"
                    onClick={() => setExpanded(v => !v)}
                >
                    <div className="mt-0.5 shrink-0">
                        {expanded
                            ? <ChevronDown className="w-4 h-4 text-slate-500" />
                            : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </div>

                    {/* Control ref */}
                    <span className="text-xs font-mono font-semibold text-slate-400 shrink-0 mt-0.5 w-16">{gap.controlRef}</span>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{gap.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{gap.category}</p>
                    </div>

                    {/* Gap type badges */}
                    <div className="flex flex-wrap gap-1.5 shrink-0 justify-end max-w-[280px]">
                        {gap.gapTypes.map(t => {
                            const info = GAP_LABELS[t];
                            return (
                                <span key={t} className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", info.color)}>
                                    {info.icon}{info.label}
                                </span>
                            );
                        })}
                    </div>
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 pt-0 border-t border-slate-800/40">
                                {/* Details row */}
                                <div className="flex flex-wrap gap-4 text-xs text-slate-500 py-3">
                                    <span>Status: <span className={cn("font-medium", STATUS_COLORS[gap.status])}>{gap.status.replace("_", " ")}</span></span>
                                    <span>Evidence: <span className="font-medium text-slate-300">{gap.evidenceCount} file{gap.evidenceCount !== 1 ? "s" : ""}</span></span>
                                    <span>Policy: <span className={cn("font-medium", gap.hasApprovedPolicy ? "text-emerald-400" : "text-red-400")}>{gap.hasApprovedPolicy ? "Covered" : "Missing"}</span></span>
                                    {gap.activeFindings.length > 0 && (
                                        <span>Findings: <span className={cn("font-medium", highestFindingSeverity === "critical" || highestFindingSeverity === "high" ? "text-red-400" : "text-amber-400")}>
                                            {gap.activeFindings.length} active ({highestFindingSeverity})
                                        </span></span>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-lg transition-colors"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5" /> Upload Evidence
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCreateRisk}
                                        disabled={actionLoading === "risk"}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === "risk"
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <ShieldAlert className="w-3.5 h-3.5" />}
                                        Create Risk
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleMarkNA}
                                        disabled={actionLoading === "na"}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/30 text-slate-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === "na"
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <MinusCircle className="w-3.5 h-3.5" />}
                                        Mark N/A
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showUpload && (
                    <EvidenceUploadModal
                        gap={gap}
                        orgId={orgId}
                        onClose={() => setShowUpload(false)}
                        onDone={() => onAction()}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function GapAssessmentClient({
    gaps: initialGaps,
    orgId,
    totalControls,
    verifiedControls,
    complianceScore,
}: GapAssessmentClientProps) {
    const router = useRouter();
    const [gaps] = useState(initialGaps);
    const [search, setSearch] = useState("");
    const [filterGapType, setFilterGapType] = useState<"all" | GapType>("all");
    const [groupBy, setGroupBy] = useState<"domain" | "framework">("domain");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const [syncing, setSyncing] = useState(false);

    const refresh = () => startTransition(() => { router.refresh(); });

    const filtered = useMemo(() => {
        let result = gaps;
        if (filterGapType !== "all") {
            result = result.filter(g => g.gapTypes.includes(filterGapType));
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(g =>
                g.title.toLowerCase().includes(q) ||
                g.controlRef.toLowerCase().includes(q) ||
                g.domain.toLowerCase().includes(q)
            );
        }
        return result;
    }, [gaps, filterGapType, search]);

    const grouped = useMemo(() => {
        const map = new Map<string, GapItem[]>();
        for (const gap of filtered) {
            const key = groupBy === "domain" ? gap.domain : gap.frameworkName;
            const arr = map.get(key) ?? [];
            arr.push(gap);
            map.set(key, arr);
        }
        return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
    }, [filtered, groupBy]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleSyncAllRisks = async () => {
        setSyncing(true);
        const res = await fetch("/api/risks/sync-from-gaps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        const j = await res.json();
        if (res.ok) toast.success(`Risks synced — ${j.created} created, ${j.skipped} already existed`);
        else toast.error(j.error ?? "Sync failed");
        setSyncing(false);
        refresh();
    };

    // Summary stats
    const totalGaps = gaps.length;
    const evidenceGaps = gaps.filter(g => g.gapTypes.includes("no_evidence")).length;
    const policyGaps = gaps.filter(g => g.gapTypes.includes("no_policy")).length;
    const findingGaps = gaps.filter(g => g.gapTypes.includes("has_finding")).length;

    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        Gap Assessment
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">
                        Live compliance gaps across all assigned frameworks — {totalGaps} gap{totalGaps !== 1 ? "s" : ""} remaining
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSyncAllRisks}
                    disabled={syncing || isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    {syncing
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <ShieldAlert className="w-4 h-4" />}
                    Sync All Risks
                </button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                    { label: "Total Gaps", value: totalGaps, color: "text-slate-200", icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
                    { label: "No Evidence", value: evidenceGaps, color: "text-amber-400", icon: <UploadCloud className="w-4 h-4 text-amber-400" /> },
                    { label: "No Policy", value: policyGaps, color: "text-sky-400", icon: <FileText className="w-4 h-4 text-sky-400" /> },
                    { label: "Active Findings", value: findingGaps, color: "text-red-400", icon: <Zap className="w-4 h-4 text-red-400" /> },
                    { label: "Compliance Score", value: `${complianceScore}%`, color: complianceScore >= 70 ? "text-emerald-400" : complianceScore >= 40 ? "text-amber-400" : "text-red-400", icon: <TrendingUp className="w-4 h-4" /> },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3">
                        <div className="shrink-0">{stat.icon}</div>
                        <div>
                            <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* All verified */}
            {totalGaps === 0 && (
                <div className="flex flex-col items-center justify-center py-24 border border-slate-800 rounded-2xl bg-slate-900/40">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-100 mb-2">No Gaps Detected</h2>
                    <p className="text-sm text-slate-400 max-w-md text-center">
                        All controls are verified or marked as not applicable. Your compliance posture looks great!
                    </p>
                </div>
            )}

            {totalGaps > 0 && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search controls…"
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-xl p-1">
                            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                            {(["all", "has_finding", "no_evidence", "no_policy", "not_started"] as const).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setFilterGapType(t)}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                                        filterGapType === t ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    {t === "all" ? "All" : GAP_LABELS[t].label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-xl p-1">
                            {(["domain", "framework"] as const).map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGroupBy(g)}
                                    className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize",
                                        groupBy === g ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={refresh}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isPending && "animate-spin")} />
                        </button>
                    </div>

                    {/* Grouped gap list */}
                    <div className="space-y-4">
                        {grouped.map(([groupKey, groupGaps]) => {
                            const isExpanded = expandedGroups.has(groupKey);
                            const criticalCount = groupGaps.filter(g => g.gapTypes.includes("has_finding")).length;

                            return (
                                <div key={groupKey} className="border border-slate-800/60 rounded-2xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(groupKey)}
                                        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded
                                                ? <ChevronDown className="w-4 h-4 text-slate-500" />
                                                : <ChevronRight className="w-4 h-4 text-slate-500" />}
                                            <span className="text-sm font-semibold text-slate-200">{groupKey}</span>
                                            <span className="text-xs text-slate-500">{groupGaps.length} gap{groupGaps.length !== 1 ? "s" : ""}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {criticalCount > 0 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                                                    {criticalCount} finding{criticalCount !== 1 ? "s" : ""}
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: "auto" }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-3 space-y-2">
                                                    {groupGaps.map(gap => (
                                                        <GapRow
                                                            key={gap.controlId}
                                                            gap={gap}
                                                            orgId={orgId}
                                                            onAction={refresh}
                                                        />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && search && (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            No gaps match &quot;{search}&quot;
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
