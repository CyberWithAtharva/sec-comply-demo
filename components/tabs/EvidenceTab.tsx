"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    UploadCloud, CheckCircle2, AlertTriangle, FileText, Shield,
    HardDrive, ArrowRight, ExternalLink, Layers
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/Card";

interface ControlItem {
    id: string;
    controlId: string;
    title: string;
    domain: string;
    category: string;
    status: string;
}

interface EvidenceTabProps {
    frameworkId: string;
    controls?: ControlItem[];
    evidenceCount?: number;
}

export function EvidenceTab({ frameworkId: _frameworkId, controls = [], evidenceCount = 0 }: EvidenceTabProps) {
    // Derive evidence coverage from control statuses
    const verified = controls.filter(c => c.status === "verified").length;
    const inProgress = controls.filter(c => c.status === "in_progress").length;
    const notStarted = controls.filter(c => !c.status || c.status === "not_started").length;
    const notApplicable = controls.filter(c => c.status === "not_applicable").length;
    const total = controls.length;

    // Controls that likely need more evidence (not_started or in_progress)
    const needsEvidence = controls
        .filter(c => c.status === "not_started" || !c.status)
        .slice(0, 10);

    // Domain breakdown of not-started controls
    const domainMap = new Map<string, number>();
    for (const c of controls.filter(c => c.status === "not_started" || !c.status)) {
        const d = c.domain || "Other";
        domainMap.set(d, (domainMap.get(d) ?? 0) + 1);
    }
    const domainGaps = Array.from(domainMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const coveragePct = total > 0 ? Math.round(((verified + notApplicable) / total) * 100) : 0;

    return (
        <motion.div
            key="evidence"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* ─── Stats Row ─── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Evidence Artifacts", value: evidenceCount, icon: FileText, color: "blue" },
                    { label: "Controls Verified", value: verified, icon: CheckCircle2, color: "emerald" },
                    { label: "In Progress", value: inProgress, icon: HardDrive, color: "indigo" },
                    { label: "Needs Evidence", value: notStarted, icon: AlertTriangle, color: notStarted > 0 ? "amber" : "emerald" },
                    { label: "Not Applicable", value: notApplicable, icon: Shield, color: "slate" },
                    { label: "Coverage", value: `${coveragePct}%`, icon: Layers, color: coveragePct >= 80 ? "emerald" : coveragePct >= 40 ? "amber" : "red" },
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

            {/* ─── Upload + Vault Link Row ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload CTA */}
                <Link href="/evidence" className="glass-panel border-dashed border-2 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/20 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[120px]">
                    <div className="p-3 bg-slate-800/50 rounded-full group-hover:scale-110 group-hover:bg-blue-500/10 transition-all mb-3">
                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-blue-300 transition-colors">Upload Evidence</span>
                    <span className="text-[10px] text-slate-500 mt-1">Opens Evidence Vault</span>
                </Link>

                {/* Evidence Vault link */}
                <Link href="/evidence" className="glass-panel p-6 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all group flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-slate-200">Evidence Vault</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                        {evidenceCount > 0
                            ? `${evidenceCount} evidence artifact${evidenceCount !== 1 ? "s" : ""} collected across your controls.`
                            : "No evidence collected yet. Upload files to link them to controls."}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                        Manage all evidence <ArrowRight className="w-3 h-3" />
                    </div>
                </Link>
            </div>

            {/* ─── Controls Needing Evidence ─── */}
            {needsEvidence.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-semibold text-slate-100">Controls Needing Evidence</h3>
                        </div>
                        <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded">
                            {notStarted} pending
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Control</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium">Domain</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg">Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {needsEvidence.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3 font-mono text-slate-300 text-xs whitespace-nowrap">{c.controlId}</td>
                                        <td className="px-4 py-3 text-slate-200 text-xs max-w-[300px]">
                                            <span className="truncate block">{c.title}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{c.domain || "—"}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{c.category || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {notStarted > 10 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/50">
                            <Link href="/evidence" className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                                View all {notStarted} controls needing evidence in Evidence Vault <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Gaps by Domain ─── */}
            {domainGaps.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Evidence Gaps by Domain</h3>
                    </div>
                    <div className="space-y-3">
                        {domainGaps.map(([domain, count]) => {
                            const domainTotal = controls.filter(c => c.domain === domain).length;
                            const gapPct = domainTotal > 0 ? Math.round((count / domainTotal) * 100) : 0;
                            return (
                                <div key={domain}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-300 font-medium">{domain}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500 text-[10px]">{count} / {domainTotal} not started</span>
                                            <span className={cn("font-bold text-[11px]", gapPct > 60 ? "text-red-400" : gapPct > 30 ? "text-amber-400" : "text-slate-400")}>
                                                {gapPct}% gap
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${gapPct}%` }}
                                            transition={{ duration: 0.8 }}
                                            className={cn("h-full rounded-full", gapPct > 60 ? "bg-red-500" : gapPct > 30 ? "bg-amber-500" : "bg-slate-500")}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty state when all controls are verified */}
            {notStarted === 0 && total > 0 && (
                <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mb-3" />
                    <p className="text-slate-200 font-medium mb-1">All controls have evidence or are verified</p>
                    <p className="text-slate-500 text-sm">
                        {evidenceCount} artifact{evidenceCount !== 1 ? "s" : ""} collected across {total} controls.
                    </p>
                    <Link href="/evidence" className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                        Manage in Evidence Vault <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </motion.div>
    );
}
