"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    TrendingUp, ShieldAlert, FileCheck, CheckCircle2,
    AlertTriangle, Shield, Target, ArrowRight, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/Card";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { CostEstimatorWidget } from "@/components/widgets/overview/CostEstimatorWidget";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OpenRisk {
    id: string;
    title: string;
    severity: string;
    status: string;
    source: string;
    category: string;
    created_at: string;
}

interface ControlItem {
    id: string;
    frameworkId: string;
    controlId: string;
    title: string;
    domain: string;
    category: string;
    status: string;
}

interface PolicyItem {
    id: string;
    title: string;
    status: string;
    framework_id: string | null;
    owner_id: string | null;
    next_review: string | null;
    version: string;
    updated_at: string;
}

interface OverviewProps {
    activeFramework: string;
    setActiveFramework: React.Dispatch<React.SetStateAction<string>>;
    frameworks: {
        id: string;
        title: string;
        subtitle: string;
        value: number;
        status: "Critical" | "Warning" | "Good";
        colorClass: string;
        gapCount?: number;
    }[];
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    activeFrameworkData?: {
        totalControls: number;
        verifiedControls: number;
        inProgressControls: number;
        notStartedControls: number;
        evidenceCount: number;
        percentage: number;
    };
    openRisks: OpenRisk[];
    allControls: ControlItem[];
    allPolicies: PolicyItem[];
}

// ─── Badge constants ──────────────────────────────────────────────────────────

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const SEV_BADGE: Record<string, string> = {
    critical: "text-red-400 bg-red-500/10 border-red-500/20",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    low: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const SOURCE_LABEL: Record<string, string> = {
    aws: "AWS",
    github: "GitHub",
    vapt: "VAPT",
    manual: "Manual",
    gap: "Gap",
};

const SOURCE_COLOR: Record<string, string> = {
    aws: "text-orange-300 bg-orange-500/10 border-orange-500/20",
    github: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    vapt: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    manual: "text-slate-300 bg-slate-500/10 border-slate-500/20",
    gap: "text-amber-300 bg-amber-500/10 border-amber-500/20",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function OverviewTab({
    activeFramework,
    setActiveFramework,
    frameworks,
    setIsModalOpen,
    activeFrameworkData,
    openRisks,
    allControls,
    allPolicies,
}: OverviewProps) {
    const totalControls = activeFrameworkData?.totalControls ?? 0;
    const verifiedControls = activeFrameworkData?.verifiedControls ?? 0;
    const inProgressControls = activeFrameworkData?.inProgressControls ?? 0;
    const notStartedControls = activeFrameworkData?.notStartedControls ?? 0;
    const score = activeFrameworkData?.percentage ?? 0;

    const approvedPolicyCount = allPolicies.filter(p => p.status === "approved").length;

    // Active vulns sorted by severity
    const sortedVulns = [...openRisks]
        .filter(r => ["aws", "github", "vapt"].includes(r.source))
        .sort((a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4))
        .slice(0, 8);

    // Data-driven action items
    const today = new Date();
    type ActionItem = { title: string; subtitle?: string; urgency: "high" | "medium"; icon: "control" | "policy" | "risk" };
    const actionItems: ActionItem[] = [
        // Not-started controls (top 3)
        ...allControls
            .filter(c => c.status === "not_started")
            .slice(0, 3)
            .map(c => ({
                title: `${c.controlId}: ${c.title}`,
                subtitle: "Control not yet started",
                urgency: "medium" as const,
                icon: "control" as const,
            })),
        // Policies due for review within 30 days
        ...allPolicies
            .filter(p => {
                if (!p.next_review) return false;
                const d = Math.ceil((new Date(p.next_review).getTime() - today.getTime()) / 86400000);
                return d >= 0 && d <= 30;
            })
            .slice(0, 2)
            .map(p => {
                const d = Math.ceil((new Date(p.next_review!).getTime() - today.getTime()) / 86400000);
                return {
                    title: `Review policy: ${p.title}`,
                    subtitle: `Due in ${d} day${d !== 1 ? "s" : ""}`,
                    urgency: (d <= 7 ? "high" : "medium") as "high" | "medium",
                    icon: "policy" as const,
                };
            }),
        // Critical/high open risks
        ...openRisks
            .filter(r => r.severity === "critical" || r.severity === "high")
            .slice(0, 2)
            .map(r => ({
                title: `Address: ${r.title}`,
                subtitle: r.category ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : undefined,
                urgency: (r.severity === "critical" ? "high" : "medium") as "high" | "medium",
                icon: "risk" as const,
            })),
    ].slice(0, 5);

    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* ── Row 1: Framework Progress Cards ── */}
            <div className="flex flex-col md:flex-row gap-6">
                {frameworks.map((fw, idx) => (
                    <motion.div
                        key={fw.id}
                        className="flex-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                    >
                        <CircularProgress
                            value={fw.value}
                            title={fw.title}
                            subtitle={fw.subtitle}
                            status={fw.status}
                            colorClass={fw.colorClass}
                            isActive={activeFramework === fw.id}
                            onClick={() => {
                                setActiveFramework(fw.id);
                                setIsModalOpen(true);
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* ── Row 2: Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Compliance Score */}
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="relative z-10">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Compliance Score</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-bold text-slate-100 tracking-tighter">{score}</span>
                            <span className="text-lg text-slate-500 font-medium">/ 100</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">Active framework</span>
                        </div>
                    </div>
                </div>

                {/* Verified Controls */}
                <div className="glass-panel p-5 rounded-2xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Verified Controls</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold text-slate-100 tracking-tighter">{verifiedControls}</span>
                        <span className="text-lg text-slate-500 font-medium">/ {totalControls}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">{inProgressControls} in progress</span>
                    </div>
                </div>

                {/* Open Risks */}
                <div className="glass-panel p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Open Risks</p>
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-4xl font-bold text-slate-100 tracking-tighter">{openRisks.length}</span>
                    <div className="mt-3">
                        <Link href="/risks" className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                            View in Risk Register <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Policies Approved */}
                <div className="glass-panel p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Policies Approved</p>
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold text-slate-100 tracking-tighter">{approvedPolicyCount}</span>
                        <span className="text-lg text-slate-500 font-medium">/ {allPolicies.length}</span>
                    </div>
                    <div className="mt-3">
                        <Link href="/policies" className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                            Manage policies <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Row 3: Active Vulns + Controls Breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Vulnerabilities */}
                <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-400" />
                            <h3 className="text-sm font-semibold text-slate-100">Active Vulnerabilities</h3>
                        </div>
                        <span className={cn(
                            "text-xs font-mono px-2.5 py-1 rounded border",
                            sortedVulns.length > 0
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>
                            {sortedVulns.length} open
                        </span>
                    </div>

                    {sortedVulns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <ShieldCheck className="w-10 h-10 text-emerald-500/50 mb-3" />
                            <p className="text-sm font-medium text-slate-300 mb-1">No active vulnerabilities</p>
                            <p className="text-xs text-slate-500">Connect AWS, GitHub, or upload a VAPT report to see findings here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/40">
                            {sortedVulns.map(v => (
                                <div key={v.id} className="flex items-start gap-4 px-6 py-3.5 hover:bg-slate-800/20 transition-colors">
                                    <div className="flex gap-2 pt-0.5 shrink-0">
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", SOURCE_COLOR[v.source] ?? SOURCE_COLOR.manual)}>
                                            {SOURCE_LABEL[v.source] ?? v.source}
                                        </span>
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", SEV_BADGE[v.severity] ?? SEV_BADGE.low)}>
                                            {v.severity}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200 truncate">{v.title}</p>
                                        {v.category && (
                                            <p className="text-xs text-slate-500 mt-0.5 capitalize">{v.category}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="px-6 py-3 border-t border-slate-800/50">
                        <Link href="/risks" className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                            View all in Risk Register <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Controls Breakdown */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col">
                    <div className="flex items-center gap-2 mb-5">
                        <Target className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-slate-100">Controls Breakdown</h3>
                    </div>

                    <div className="flex flex-col gap-5 flex-1 justify-center">
                        {[
                            { label: "Verified", count: verifiedControls, total: totalControls, color: "bg-emerald-500", textColor: "text-emerald-400" },
                            { label: "In Progress", count: inProgressControls, total: totalControls, color: "bg-blue-500", textColor: "text-blue-400" },
                            { label: "Not Started", count: notStartedControls, total: totalControls, color: "bg-slate-600", textColor: "text-slate-400" },
                        ].map(item => {
                            const pct = totalControls > 0 ? Math.round((item.count / totalControls) * 100) : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-slate-300">{item.label}</span>
                                        <span className={cn("text-xs font-semibold tabular-nums", item.textColor)}>
                                            {item.count} <span className="text-slate-500 font-normal">/ {item.total}</span>
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                        <motion.div
                                            className={cn("h-full rounded-full", item.color)}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/50">
                        <p className="text-xs text-slate-500">
                            {notStartedControls > 0
                                ? `${notStartedControls} control${notStartedControls !== 1 ? "s" : ""} need attention`
                                : "All controls tracked"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Row 4: Next Actions + Cost Estimator ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next Action Items — data-driven */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-slate-100">Next Action Items</h3>
                        {actionItems.length > 0 && (
                            <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded">
                                {actionItems.length} pending
                            </span>
                        )}
                    </div>

                    {actionItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle2 className="w-9 h-9 text-emerald-500/50 mb-3" />
                            <p className="text-sm font-medium text-slate-300 mb-1">All caught up!</p>
                            <p className="text-xs text-slate-500">No pending controls, policy reviews, or open risks.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {actionItems.map((item, i) => {
                                const isHigh = item.urgency === "high";
                                const Icon = item.icon === "control" ? Target
                                    : item.icon === "policy" ? FileCheck
                                    : AlertTriangle;
                                return (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/40 transition-colors"
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg border shrink-0 mt-0.5",
                                            isHigh ? "bg-red-500/10 border-red-500/20" : "bg-blue-500/10 border-blue-500/20"
                                        )}>
                                            <Icon className={cn("w-4 h-4", isHigh ? "text-red-400" : "text-blue-400")} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-200 leading-snug line-clamp-2">{item.title}</p>
                                            {item.subtitle && (
                                                <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Cost Estimator */}
                <div>
                    <CostEstimatorWidget />
                </div>
            </div>
        </motion.div>
    );
}
