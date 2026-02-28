"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    FileText, CheckCircle2, Clock, ChevronDown, History,
    AlertTriangle, ArrowUpRight, Eye, RefreshCw, Calendar, BookOpen,
    Target, ExternalLink, Sparkles
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { PolicyData } from "@/components/programs/ProgramsClient";

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "TBD";
    try {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
        return dateStr;
    }
}

function formatRelative(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return "today";
        if (days === 1) return "yesterday";
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        if (days < 365) return `${Math.floor(days / 30)}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    } catch {
        return dateStr;
    }
}

function normalizeStatus(status: string): string {
    if (status === "approved") return "Approved";
    if (status === "under_review") return "Under Review";
    return "Draft";
}

function coverageFromStatus(status: string): number {
    if (status === "approved") return 100;
    if (status === "under_review") return 60;
    return 20;
}

export function PoliciesTab({ frameworkId, policies }: { frameworkId: string; policies: PolicyData[] }) {
    const router = useRouter();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [generating, setGenerating] = useState(false);
    const [genMessage, setGenMessage] = useState<string | null>(null);

    const approved = policies.filter(p => p.status === "approved").length;
    const underReview = policies.filter(p => p.status === "under_review").length;
    const draft = policies.filter(p => !["approved", "under_review"].includes(p.status)).length;
    const avgCoverage = policies.length > 0
        ? Math.round(policies.reduce((a, p) => a + coverageFromStatus(p.status), 0) / policies.length)
        : 0;

    async function handleGenerate() {
        setGenerating(true);
        setGenMessage(null);
        try {
            const res = await fetch("/api/policies/generate", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setGenMessage(`Generated ${data.generated} policies (${data.skipped} already existed).`);
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            setGenMessage(e instanceof Error ? e.message : "Generation failed.");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <motion.div
            key="policies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* ─── Empty state / Generate CTA ──────────────────────────── */}
            {policies.length === 0 && (
                <div className="glass-panel p-10 rounded-2xl border border-dashed border-blue-500/30 flex flex-col items-center text-center space-y-5">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <Sparkles className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">No Policies Yet</h3>
                        <p className="text-sm text-slate-500 max-w-md">
                            Generate a complete set of compliance-ready policy templates for your assigned
                            frameworks in one click. Edit them inline in the Policy Center afterward.
                        </p>
                    </div>
                    {genMessage ? (
                        <p className="text-sm text-emerald-400">{genMessage}</p>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                        >
                            {generating
                                ? <RefreshCw className="w-4 h-4 animate-spin" />
                                : <Sparkles className="w-4 h-4" />}
                            {generating ? "Generating…" : "Generate Policy Templates"}
                        </button>
                    )}
                </div>
            )}

            {policies.length > 0 && (
                <>
                    {/* ─── Stats Row ───────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { label: "Total Policies", value: policies.length, icon: BookOpen, color: "blue" },
                            { label: "Approved", value: approved, icon: CheckCircle2, color: "emerald" },
                            { label: "Under Review", value: underReview, icon: Clock, color: "amber" },
                            { label: "Draft", value: draft, icon: FileText, color: "slate" },
                            { label: "Approval Rate", value: `${avgCoverage}%`, icon: Target, color: avgCoverage >= 80 ? "emerald" : "amber" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-panel p-4 rounded-xl border border-slate-800/50 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={cn("p-1.5 rounded-lg", `bg-${stat.color}-500/10`)}>
                                        <stat.icon className={cn("w-3.5 h-3.5", `text-${stat.color}-400`)} />
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-slate-100">{stat.value}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-1">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* ─── Approval Pipeline ───────────────────────────── */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <RefreshCw className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Approval Pipeline</span>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                            >
                                {generating
                                    ? <RefreshCw className="w-3 h-3 animate-spin" />
                                    : <Sparkles className="w-3 h-3" />}
                                {generating ? "Generating…" : "Add Templates"}
                            </button>
                        </div>
                        {genMessage && (
                            <p className="text-xs text-emerald-400 mb-3">{genMessage}</p>
                        )}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {[
                                { stage: "Draft", count: draft, color: "slate", icon: FileText },
                                { stage: "Under Review", count: underReview, color: "amber", icon: Eye },
                                { stage: "Approved", count: approved, color: "emerald", icon: CheckCircle2 },
                            ].map((stage, i) => (
                                <React.Fragment key={stage.stage}>
                                    <div className={cn(
                                        "flex items-center space-x-3 px-5 py-3 rounded-xl border flex-shrink-0 min-w-[140px]",
                                        `bg-${stage.color}-500/5 border-${stage.color}-500/20`
                                    )}>
                                        <div className={cn("p-2 rounded-lg", `bg-${stage.color}-500/10`)}>
                                            <stage.icon className={cn("w-4 h-4", `text-${stage.color}-400`)} />
                                        </div>
                                        <div>
                                            <span className="text-lg font-bold text-slate-100">{stage.count}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{stage.stage}</span>
                                        </div>
                                    </div>
                                    {i < 2 && (
                                        <div className="flex items-center flex-shrink-0">
                                            <div className="w-8 h-px bg-slate-700" />
                                            <ArrowUpRight className="w-3 h-3 text-slate-600 -ml-1" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* ─── Policy Table ─────────────────────────────────── */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
                            <h3 className="text-lg font-semibold text-slate-100">Governing Standards</h3>
                            <a
                                href="/policies"
                                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Manage All <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/40">
                                    <tr>
                                        <th className="px-4 py-3 font-medium rounded-tl-lg">Policy Name</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-center">Progress</th>
                                        <th className="px-4 py-3 font-medium">Version</th>
                                        <th className="px-4 py-3 font-medium">Next Review</th>
                                        <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {policies.map((pol) => {
                                        const isExpanded = expandedId === pol.id;
                                        const displayStatus = normalizeStatus(pol.status);
                                        const coverage = coverageFromStatus(pol.status);
                                        return (
                                            <React.Fragment key={pol.id}>
                                                <tr
                                                    onClick={() => setExpandedId(isExpanded ? null : pol.id)}
                                                    className={cn(
                                                        "transition-colors group cursor-pointer",
                                                        isExpanded ? "bg-blue-500/[0.03]" : "hover:bg-slate-800/30"
                                                    )}
                                                >
                                                    <td className="px-4 py-3 font-medium text-slate-200 group-hover:text-blue-400 transition-colors max-w-[280px]">
                                                        <span className="block truncate">{pol.title}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={cn(
                                                            "px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border flex items-center w-max gap-1",
                                                            pol.status === "approved"
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                : pol.status === "under_review"
                                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                        )}>
                                                            {pol.status === "approved"
                                                                ? <CheckCircle2 className="w-2.5 h-2.5" />
                                                                : <Clock className="w-2.5 h-2.5" />}
                                                            {displayStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <div className="w-16 bg-slate-800/60 rounded-full h-1 overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full",
                                                                        coverage >= 80 ? "bg-emerald-500" : coverage >= 50 ? "bg-amber-500" : "bg-slate-500"
                                                                    )}
                                                                    style={{ width: `${coverage}%` }}
                                                                />
                                                            </div>
                                                            <span className={cn(
                                                                "text-[10px] font-bold",
                                                                coverage >= 80 ? "text-emerald-400" : coverage >= 50 ? "text-amber-400" : "text-slate-500"
                                                            )}>
                                                                {coverage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-slate-300 text-xs">
                                                        {pol.version || "1.0"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                                        {formatDate(pol.next_review)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <span className="text-xs text-slate-500">
                                                                {formatRelative(pol.updated_at)}
                                                            </span>
                                                            <motion.div
                                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <ChevronDown className={cn(
                                                                    "w-4 h-4",
                                                                    isExpanded ? "text-blue-400" : "text-slate-500"
                                                                )} />
                                                            </motion.div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* ─── Expanded Detail Row ─── */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan={6} className="px-4 py-0">
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="py-4">
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            {/* Details card */}
                                                                            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                                <div className="flex items-center space-x-2 mb-3">
                                                                                    <History className="w-4 h-4 text-amber-400" />
                                                                                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Policy Details</span>
                                                                                </div>
                                                                                <div className="space-y-2.5 text-xs">
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-slate-500">Version</span>
                                                                                        <span className="font-mono text-slate-300">{pol.version || "1.0"}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-slate-500">Status</span>
                                                                                        <span className={cn(
                                                                                            "font-medium",
                                                                                            pol.status === "approved" ? "text-emerald-400" :
                                                                                                pol.status === "under_review" ? "text-amber-400" : "text-slate-400"
                                                                                        )}>{displayStatus}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-slate-500">Next Review</span>
                                                                                        <span className="text-slate-300">{formatDate(pol.next_review)}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-slate-500">Last Updated</span>
                                                                                        <span className="text-slate-300">{formatRelative(pol.updated_at)}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Action card */}
                                                                            <div className="md:col-span-2 bg-slate-900/40 rounded-xl border border-slate-800/50 p-4 flex flex-col items-center justify-center space-y-3">
                                                                                <p className="text-xs text-slate-500 text-center">
                                                                                    View full content, edit inline, manage approvals, and link controls in the Policy Center.
                                                                                </p>
                                                                                <a
                                                                                    href="/policies"
                                                                                    onClick={e => e.stopPropagation()}
                                                                                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm font-medium transition-colors"
                                                                                >
                                                                                    <ExternalLink className="w-4 h-4" />
                                                                                    Open in Policy Center
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ─── Upcoming Reviews ─────────────────────────────── */}
                    {policies.some(p => p.next_review) && (
                        <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center space-x-2 mb-4">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Upcoming Reviews</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {policies
                                    .filter(p => p.next_review)
                                    .sort((a, b) => (a.next_review ?? "").localeCompare(b.next_review ?? ""))
                                    .slice(0, 8)
                                    .map((pol) => (
                                        <div
                                            key={pol.id}
                                            className="flex items-center space-x-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/40 transition-colors"
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg flex-shrink-0",
                                                pol.status === "approved" ? "bg-emerald-500/10" : "bg-amber-500/10"
                                            )}>
                                                <Calendar className={cn(
                                                    "w-4 h-4",
                                                    pol.status === "approved" ? "text-emerald-400" : "text-amber-400"
                                                )} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-medium text-slate-200 truncate">{pol.title}</span>
                                                <span className="text-[10px] text-slate-500">{formatDate(pol.next_review)}</span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </>
            )}

        </motion.div>
    );
}
