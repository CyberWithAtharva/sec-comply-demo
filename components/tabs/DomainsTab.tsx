"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, ShieldAlert, ShieldCheck, ChevronDown, CheckCircle2, AlertTriangle, FileText,
    TrendingUp, TrendingDown, Activity, Target, Layers
} from "lucide-react";
import { cn } from "@/components/ui/Card";

interface ControlItem {
    id: string;
    controlId: string;
    title: string;
    domain: string;
    category: string;
    status: string;
}

interface DomainData {
    name: string;
    score: number;
    status: "Good" | "Warning" | "Critical";
    total: number;
    verified: number;
    inProgress: number;
    notStarted: number;
    subcategories: { name: string; controls: number; passed: number }[];
}

export function DomainsTab({ frameworkId, controls = [] }: { frameworkId: string; controls?: ControlItem[] }) {
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

    // Derive real domain data from controls prop
    const domains: DomainData[] = React.useMemo(() => {
        if (controls.length === 0) return [];

        const domainMap = new Map<string, ControlItem[]>();
        for (const c of controls) {
            const d = c.domain || "Other";
            if (!domainMap.has(d)) domainMap.set(d, []);
            domainMap.get(d)!.push(c);
        }

        return Array.from(domainMap.entries()).map(([name, ctrls]) => {
            const verified = ctrls.filter(c => c.status === "verified" || c.status === "not_applicable").length;
            const inProgress = ctrls.filter(c => c.status === "in_progress").length;
            const notStarted = ctrls.filter(c => !c.status || c.status === "not_started").length;
            const total = ctrls.length;
            const score = total > 0 ? Math.round((verified / total) * 100) : 0;
            const status: "Good" | "Warning" | "Critical" = score >= 80 ? "Good" : score >= 40 ? "Warning" : "Critical";

            // Group by category for subcategories
            const catMap = new Map<string, ControlItem[]>();
            for (const c of ctrls) {
                const cat = c.category || "General";
                if (!catMap.has(cat)) catMap.set(cat, []);
                catMap.get(cat)!.push(c);
            }
            const subcategories = Array.from(catMap.entries()).map(([catName, catCtrls]) => {
                const catVerified = catCtrls.filter(c => c.status === "verified" || c.status === "not_applicable").length;
                return { name: catName, controls: catCtrls.length, passed: catVerified };
            });

            return { name, score, status, total, verified, inProgress, notStarted, subcategories };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [controls]);

    // Empty state when no controls
    if (domains.length === 0) {
        return (
            <motion.div
                key="domains"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center py-24 text-center"
            >
                <Layers className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-300 font-medium mb-1">No controls loaded</p>
                <p className="text-slate-500 text-sm">Select a framework to see domain breakdown.</p>
            </motion.div>
        );
    }

    // Aggregate stats — all real
    const totalControls = domains.reduce((a, d) => a + d.total, 0);
    const totalVerified = domains.reduce((a, d) => a + d.verified, 0);
    const totalInProgress = domains.reduce((a, d) => a + d.inProgress, 0);
    const totalNotStarted = domains.reduce((a, d) => a + d.notStarted, 0);
    const avgScore = Math.round(domains.reduce((a, d) => a + d.score, 0) / domains.length);
    const domainsHealthy = domains.filter(d => d.status === "Good").length;

    return (
        <motion.div
            key="domains"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* ─── W1: Aggregate Stats Row ─── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Overall Score", value: `${avgScore}%`, icon: Target, color: avgScore >= 80 ? "emerald" : avgScore >= 60 ? "amber" : "red" },
                    { label: "Controls Passed", value: `${totalVerified}/${totalControls}`, icon: CheckCircle2, color: "emerald" },
                    { label: "In Progress", value: `${totalInProgress}`, icon: Activity, color: "blue" },
                    { label: "Not Started", value: `${totalNotStarted}`, icon: AlertTriangle, color: totalNotStarted > 0 ? "amber" : "emerald" },
                    { label: "Domains Healthy", value: `${domainsHealthy}/${domains.length}`, icon: ShieldCheck, color: domainsHealthy === domains.length ? "emerald" : "amber" },
                    { label: "Total Domains", value: `${domains.length}`, icon: Layers, color: "slate" },
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

            {/* ─── W2: Domain Score Cards (expandable) ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((domain, i) => {
                    const isExpanded = expandedDomain === domain.name;
                    return (
                        <div key={domain.name} className="flex flex-col">
                            <div
                                onClick={() => setExpandedDomain(isExpanded ? null : domain.name)}
                                className={cn(
                                    "glass-panel p-6 rounded-2xl border transition-all group cursor-pointer",
                                    isExpanded ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-slate-800/50 hover:border-slate-700"
                                )}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn(
                                        "p-3 rounded-xl border",
                                        domain.status === "Good" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                            domain.status === "Warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                                "bg-red-500/10 border-red-500/20 text-red-400"
                                    )}>
                                        {domain.status === "Good" ? <ShieldCheck className="w-6 h-6" /> : domain.status === "Warning" ? <Shield className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-slate-100 tracking-tight">{domain.score}</span>
                                            <span className="text-sm font-medium text-slate-500 ml-1">/ 100</span>
                                        </div>
                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                            <ChevronDown className={cn("w-4 h-4", isExpanded ? "text-blue-400" : "text-slate-500")} />
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-semibold text-slate-200 truncate pr-2">{domain.name}</h3>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex-shrink-0",
                                        domain.status === "Good" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            domain.status === "Warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>{domain.status}</span>
                                </div>

                                <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${domain.score}%` }}
                                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                        className={cn(
                                            "h-full rounded-full",
                                            domain.status === "Good" ? "bg-emerald-500" :
                                                domain.status === "Warning" ? "bg-amber-500" : "bg-red-500"
                                        )}
                                    />
                                </div>

                                {/* Quick stats bar */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50 text-[10px]">
                                    <span className="text-slate-500">{domain.subcategories.length} categories</span>
                                    <span className="text-slate-500">{domain.total} controls</span>
                                    <span className={cn(domain.verified === domain.total ? "text-emerald-400" : "text-slate-500")}>
                                        {domain.verified} verified
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Detail Panel */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-2 glass-panel rounded-xl border border-blue-500/20 p-4 space-y-4">
                                            {/* Subcategory Breakdown */}
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Categories</span>
                                                <div className="space-y-2">
                                                    {domain.subcategories.map((sub, j) => {
                                                        const pct = sub.controls > 0 ? Math.round((sub.passed / sub.controls) * 100) : 0;
                                                        return (
                                                            <div key={j} className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/50">
                                                                <div className="flex items-center space-x-2">
                                                                    {pct === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                                                                    <span className="text-xs font-medium text-slate-200">{sub.name}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-4 text-[10px] text-slate-500">
                                                                    <span className={cn("font-bold", pct >= 90 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400")}>{pct}%</span>
                                                                    <span>{sub.passed}/{sub.controls} controls</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Control Coverage Bar */}
                                            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Layers className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Control Coverage</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {domain.subcategories.map((sub, j) => {
                                                        const pct = sub.controls > 0 ? Math.round((sub.passed / sub.controls) * 100) : 0;
                                                        return (
                                                            <div key={j}>
                                                                <div className="flex justify-between text-[11px] mb-1">
                                                                    <span className="text-slate-300 font-medium truncate pr-2">{sub.name}</span>
                                                                    <span className={cn("font-bold flex-shrink-0", pct === 100 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400")}>
                                                                        {pct}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${pct}%` }}
                                                                        transition={{ duration: 0.8, delay: j * 0.1 }}
                                                                        className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500")}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* ─── Domain Comparison Table ─── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex items-center space-x-2 mb-4">
                    <Activity className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Domain Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">Domain</th>
                                <th className="px-4 py-3 font-medium text-center">Score</th>
                                <th className="px-4 py-3 font-medium text-center">Verified</th>
                                <th className="px-4 py-3 font-medium text-center">In Progress</th>
                                <th className="px-4 py-3 font-medium text-center">Not Started</th>
                                <th className="px-4 py-3 font-medium text-center rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {domains.map((d) => (
                                <tr key={d.name} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-4 py-3 text-slate-200 font-medium">{d.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn("font-bold", d.score >= 80 ? "text-emerald-400" : d.score >= 60 ? "text-amber-400" : "text-red-400")}>{d.score}%</span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-emerald-400 text-xs font-semibold">{d.verified}</td>
                                    <td className="px-4 py-3 text-center text-blue-400 text-xs font-semibold">{d.inProgress}</td>
                                    <td className="px-4 py-3 text-center text-slate-400 text-xs">{d.notStarted}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                                            d.status === "Good" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                d.status === "Warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>{d.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
