"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileBadge, FileJson, FileLock2, UploadCloud, ChevronDown, CheckCircle2, Clock,
    FileText, AlertTriangle, Link, Eye, Layers, BarChart3, Calendar, Shield,
    HardDrive, ArrowUpRight, Target, XCircle, Search, Filter
} from "lucide-react";
import { cn } from "@/components/ui/Card";

export function EvidenceTab({ frameworkId }: { frameworkId: string }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>("All");

    const getMultiplier = (id: string) => (id === "iso27001" ? 2 : id === "dpd" ? 0.5 : 1);
    const m = getMultiplier(frameworkId);

    const evidence = [
        {
            id: `EV-991`, name: "SOC 2 Readiness Assessment", type: "PDF", size: "5.2 MB", date: "Oct 18", icon: FileBadge,
            mapped: 8, status: "Current", collector: "Auditor", domain: "Security",
            linkedControls: ["CC1.1", "CC1.2", "CC2.1", "CC6.1"], lastValidated: "2 days ago",
            details: "Comprehensive readiness assessment covering all TSC domains with gap analysis and remediation roadmap."
        },
        {
            id: `EV-992`, name: "Q3 Access Review", type: "PDF", size: "2.4 MB", date: "Oct 12", icon: FileBadge,
            mapped: Math.max(1, Math.round(4 * m)), status: "Current", collector: "IT Admin", domain: "Access",
            linkedControls: ["CC6.1", "CC6.2", "CC6.3"], lastValidated: "5 days ago",
            details: "Quarterly review of all user access across production systems, including terminated employee audit."
        },
        {
            id: `EV-993`, name: "AWS CloudTrail Logs", type: "JSON", size: "14.1 MB", date: "Oct 14", icon: FileJson,
            mapped: Math.max(1, Math.round(12 * m)), status: "Current", collector: "Automated", domain: "Monitoring",
            linkedControls: ["CC4.1", "CC6.6", "CC7.2"], lastValidated: "1 hour ago",
            details: "Continuous cloud audit trail from all 3 AWS regions covering API calls, console logins, and S3 access."
        },
        {
            id: `EV-994`, name: "Penetration Test Report", type: "PDF", size: "8.9 MB", date: "Sep 22", icon: FileLock2,
            mapped: Math.max(1, Math.round(2 * m)), status: "Current", collector: "External", domain: "Security",
            linkedControls: ["CC3.2", "CC6.6", "CC6.8"], lastValidated: "3 weeks ago",
            details: "Annual penetration test by CrowdStrike covering external perimeter, web apps, and API endpoints."
        },
        {
            id: `EV-995`, name: "DB Encryption Config", type: "JSON", size: "45 KB", date: "Oct 01", icon: FileJson,
            mapped: Math.max(1, Math.round(1 * m)), status: "Current", collector: "Automated", domain: "Data",
            linkedControls: ["CC6.7", "C1.1"], lastValidated: "12 hours ago",
            details: "AES-256 encryption configuration export from RDS and DynamoDB including key rotation settings."
        },
        {
            id: `EV-996`, name: "Vendor SOC 2 Reports", type: "PDF", size: "22.3 MB", date: "Aug 15", icon: FileBadge,
            mapped: 6, status: "Stale", collector: "Procurement", domain: "Vendor",
            linkedControls: ["CC9.1", "CC9.2"], lastValidated: "67 days ago",
            details: "SOC 2 Type II reports from Tier 1 vendors (Stripe, Datadog, MongoDB Atlas). Stripe report pending renewal."
        },
        {
            id: `EV-997`, name: "BCP Test Results", type: "PDF", size: "3.1 MB", date: "Jul 20", icon: FileBadge,
            mapped: 3, status: "Stale", collector: "SRE", domain: "Operations",
            linkedControls: ["A1.2", "A1.3"], lastValidated: "90 days ago",
            details: "Business continuity plan tabletop exercise results including RTO/RPO validation metrics."
        },
        {
            id: `EV-998`, name: "Privacy Impact Assessment", type: "PDF", size: "4.6 MB", date: "Sep 30", icon: FileBadge,
            mapped: 5, status: "Current", collector: "Legal", domain: "Privacy",
            linkedControls: ["P1.1", "P1.3", "P1.5", "P2.1"], lastValidated: "1 week ago",
            details: "PIA covering all data processing activities, cross-border transfers, and consent management flows."
        },
        {
            id: `EV-999`, name: "SIEM Alert Config", type: "JSON", size: "890 KB", date: "Oct 10", icon: FileJson,
            mapped: 4, status: "Current", collector: "Automated", domain: "Monitoring",
            linkedControls: ["CC4.1", "CC4.2", "CC7.1"], lastValidated: "3 hours ago",
            details: "Splunk SIEM alert rules covering credential stuffing, privilege escalation, and data exfiltration patterns."
        },
        {
            id: `EV-1000`, name: "Employee Training Certs", type: "PDF", size: "18.7 MB", date: "Oct 05", icon: FileBadge,
            mapped: 3, status: "Current", collector: "HR", domain: "Training",
            linkedControls: ["CC1.4", "CC1.5"], lastValidated: "4 days ago",
            details: "Security awareness training completion certificates for all 142 employees with phishing simulation results."
        },
    ];

    const filteredEvidence = filterType === "All" ? evidence : evidence.filter(e => e.type === filterType);

    // Aggregate stats
    const totalEvidence = evidence.length;
    const totalMapped = evidence.reduce((a, e) => a + e.mapped, 0);
    const currentCount = evidence.filter(e => e.status === "Current").length;
    const staleCount = evidence.filter(e => e.status === "Stale").length;
    const autoCollected = evidence.filter(e => e.collector === "Automated").length;
    const uniqueControls = new Set(evidence.flatMap(e => e.linkedControls)).size;
    const types = ["All", ...Array.from(new Set(evidence.map(e => e.type)))];

    return (
        <motion.div
            key="evidence"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* ─── W1: Aggregate Stats Row ─────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Total Evidence", value: totalEvidence, icon: FileText, color: "blue" },
                    { label: "Controls Mapped", value: totalMapped, icon: Link, color: "indigo" },
                    { label: "Unique Controls", value: uniqueControls, icon: Shield, color: "emerald" },
                    { label: "Current", value: currentCount, icon: CheckCircle2, color: "emerald" },
                    { label: "Stale", value: staleCount, icon: AlertTriangle, color: staleCount > 0 ? "red" : "emerald" },
                    { label: "Auto-Collected", value: autoCollected, icon: HardDrive, color: "blue" },
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

            {/* ─── W2: Upload Zone + W3: Type Filter ───────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel border-dashed border-2 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/20 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[120px]">
                    <div className="p-3 bg-slate-800/50 rounded-full group-hover:scale-110 group-hover:bg-blue-500/10 transition-all mb-3">
                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">Upload Evidence</span>
                    <span className="text-[10px] text-slate-500 mt-1">Drag & drop or click</span>
                </div>

                {/* W3: Type Distribution */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800/50 col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Evidence Distribution</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Filter className="w-3 h-3 text-slate-500" />
                            {types.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={cn(
                                        "text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all",
                                        filterType === t
                                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {Array.from(new Set(evidence.map(e => e.domain))).map((domain) => {
                            const count = evidence.filter(e => e.domain === domain).length;
                            const pct = Math.round((count / evidence.length) * 100);
                            return (
                                <div key={domain}>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-slate-300 font-medium">{domain}</span>
                                        <span className="text-slate-500">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-800/60 rounded-full h-1 overflow-hidden">
                                        <div className="h-full rounded-full bg-blue-500/60" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── W4: Evidence Table (expandable) ─────────────────── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-4">
                    <h3 className="text-lg font-semibold text-slate-100">Evidence Library</h3>
                    <span className="text-xs text-slate-500">{filteredEvidence.length} items</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Domain</th>
                                <th className="px-4 py-3 font-medium text-center">Mapped</th>
                                <th className="px-4 py-3 font-medium">Collector</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredEvidence.map((ev) => {
                                const isExpanded = expandedId === ev.id;
                                return (
                                    <React.Fragment key={ev.id}>
                                        <tr
                                            onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                                            className={cn("transition-colors group cursor-pointer", isExpanded ? "bg-blue-500/[0.03]" : "hover:bg-slate-800/30")}
                                        >
                                            <td className="px-4 py-3 font-mono text-slate-300 text-xs">{ev.id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                                                <div className="flex items-center space-x-2">
                                                    <ev.icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                    <span className="truncate max-w-[200px]">{ev.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-mono uppercase text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{ev.type}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{ev.domain}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{ev.mapped}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className={cn(
                                                    ev.collector === "Automated" ? "text-emerald-400" : "text-slate-400"
                                                )}>{ev.collector}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                                                    ev.status === "Current" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                                )}>{ev.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <span className="text-xs text-slate-500">{ev.date}</span>
                                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                        <ChevronDown className={cn("w-4 h-4", isExpanded ? "text-blue-400" : "text-slate-500")} />
                                                    </motion.div>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* ─── W5-W8: Expanded Row Detail ──── */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-0">
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="py-4 space-y-4">
                                                                {/* W5: Description */}
                                                                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <Eye className="w-4 h-4 text-blue-400" />
                                                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-400 leading-relaxed">{ev.details}</p>
                                                                    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-slate-800/50 text-[10px] text-slate-500">
                                                                        <span>Size: <span className="text-slate-300">{ev.size}</span></span>
                                                                        <span>Last Validated: <span className="text-slate-300">{ev.lastValidated}</span></span>
                                                                    </div>
                                                                </div>

                                                                {/* W6 + W7: Linked Controls + Metadata */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {/* W6: Linked Controls */}
                                                                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                            <Link className="w-4 h-4 text-emerald-400" />
                                                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Linked Controls</span>
                                                                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                                                                {ev.linkedControls.length}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {ev.linkedControls.map((c, i) => (
                                                                                <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors cursor-pointer">
                                                                                    {c}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* W7: Collection Metadata */}
                                                                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                            <Layers className="w-4 h-4 text-indigo-400" />
                                                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Metadata</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {[
                                                                                { k: "Collector", v: ev.collector },
                                                                                { k: "Domain", v: ev.domain },
                                                                                { k: "Format", v: ev.type },
                                                                                { k: "Size", v: ev.size },
                                                                                { k: "Collected", v: ev.date },
                                                                                { k: "Validated", v: ev.lastValidated },
                                                                            ].map((meta, i) => (
                                                                                <div key={i} className="text-[10px]">
                                                                                    <span className="text-slate-500">{meta.k}: </span>
                                                                                    <span className="text-slate-300 font-medium">{meta.v}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* W8: Staleness Indicator */}
                                                                {ev.status === "Stale" && (
                                                                    <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-4 flex items-start space-x-3">
                                                                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                                        <div>
                                                                            <span className="text-sm font-semibold text-red-300">Evidence Stale</span>
                                                                            <p className="text-xs text-red-400/70 mt-1">
                                                                                Last validated {ev.lastValidated}. This evidence needs to be refreshed to maintain compliance coverage.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
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

            {/* ─── W9: Evidence Health Score ────────────────────────── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Evidence Health by Domain</h3>
                </div>
                <div className="space-y-3">
                    {Array.from(new Set(evidence.map(e => e.domain))).map((domain) => {
                        const domainEvidence = evidence.filter(e => e.domain === domain);
                        const currentPct = Math.round((domainEvidence.filter(e => e.status === "Current").length / domainEvidence.length) * 100);
                        return (
                            <div key={domain}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-medium">{domain}</span>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-[10px] text-slate-500">
                                            {domainEvidence.filter(e => e.status === "Current").length}/{domainEvidence.length} current
                                        </span>
                                        <span className={cn("font-bold text-[11px]", currentPct === 100 ? "text-emerald-400" : currentPct >= 50 ? "text-amber-400" : "text-red-400")}>
                                            {currentPct}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${currentPct}%` }}
                                        transition={{ duration: 0.8 }}
                                        className={cn("h-full rounded-full", currentPct === 100 ? "bg-emerald-500" : currentPct >= 50 ? "bg-amber-500" : "bg-red-500")}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ─── W10: Collection Timeline ────────────────────────── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Recent Collection Activity</h3>
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-800/50" />
                    <div className="space-y-4 pl-8">
                        {evidence
                            .sort((a, b) => {
                                const order: Record<string, number> = { "1 hour ago": 0, "3 hours ago": 1, "12 hours ago": 2 };
                                return (order[a.lastValidated] ?? 10) - (order[b.lastValidated] ?? 10);
                            })
                            .slice(0, 6)
                            .map((ev, i) => (
                                <motion.div
                                    key={ev.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="relative flex items-start space-x-3"
                                >
                                    {/* Timeline dot */}
                                    <div className={cn(
                                        "absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2",
                                        ev.status === "Current"
                                            ? "bg-emerald-500 border-emerald-500/30"
                                            : "bg-red-500 border-red-500/30"
                                    )} />
                                    <div className="flex-1 flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <ev.icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                            <div>
                                                <span className="text-xs font-medium text-slate-200">{ev.name}</span>
                                                <span className="text-[10px] text-slate-500 ml-2 font-mono">{ev.id}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-[10px] text-slate-500">{ev.collector}</span>
                                            <span className="text-[10px] text-slate-400">{ev.lastValidated}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
