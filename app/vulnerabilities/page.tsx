"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert, Activity, GitPullRequest, ArrowUpRight, TrendingDown,
    Bug, Clock, AlertTriangle, CheckCircle2, Zap, Target,
    ExternalLink, ChevronRight
} from "lucide-react";
import { cn } from "@/components/ui/Card";

const statCards = [
    { label: "Critical CVEs", count: "12", trend: "+2", isGood: false },
    { label: "High Severity", count: "45", trend: "-5", isGood: true },
    { label: "Mean Time to Remediate", count: "14d", trend: "-2d", isGood: true },
    { label: "SLA Breaches", count: "3", trend: "+1", isGood: false },
];

const topCVEs = [
    { id: "CVE-2024-21762", cvss: 9.8, product: "FortiOS SSL-VPN", status: "Patching", sla: "2 days left", severity: "critical" },
    { id: "CVE-2024-3400", cvss: 10.0, product: "PAN-OS GlobalProtect", status: "Mitigated", sla: "Resolved", severity: "critical" },
    { id: "CVE-2024-23897", cvss: 9.1, product: "Jenkins CLI", status: "In Progress", sla: "5 days left", severity: "critical" },
    { id: "CVE-2024-1709", cvss: 8.4, product: "ScreenConnect Auth", status: "Patching", sla: "8 days left", severity: "high" },
    { id: "CVE-2024-0204", cvss: 9.8, product: "GoAnywhere MFT", status: "Verifying", sla: "1 day left", severity: "critical" },
    { id: "CVE-2024-24576", cvss: 7.5, product: "Rust std::process", status: "Monitoring", sla: "14 days left", severity: "high" },
];

const severityBreakdown = [
    { label: "Critical", count: 12, color: "bg-red-500", pct: 8 },
    { label: "High", count: 45, color: "bg-orange-500", pct: 30 },
    { label: "Medium", count: 62, color: "bg-amber-500", pct: 41 },
    { label: "Low", count: 28, color: "bg-emerald-500", pct: 19 },
    { label: "Informational", count: 3, color: "bg-slate-500", pct: 2 },
];

const pendingPatches = [
    { package: "openssl", current: "3.0.12", target: "3.0.13", affected: 184, priority: "critical" },
    { package: "log4j-core", current: "2.17.0", target: "2.23.1", affected: 12, priority: "high" },
    { package: "spring-boot", current: "3.1.5", target: "3.2.2", affected: 45, priority: "medium" },
    { package: "nginx", current: "1.24.0", target: "1.25.4", affected: 28, priority: "high" },
    { package: "postgresql", current: "15.4", target: "16.2", affected: 8, priority: "medium" },
];

const burndownData = [
    { month: "Jul", open: 180, closed: 0 },
    { month: "Aug", open: 165, closed: 42 },
    { month: "Sep", open: 158, closed: 67 },
    { month: "Oct", open: 142, closed: 105 },
    { month: "Nov", open: 130, closed: 136 },
    { month: "Dec", open: 147, closed: 150 },
];

export default function VulnerabilitiesPage() {
    const maxVal = Math.max(...burndownData.map(d => Math.max(d.open, d.closed)));

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-500" />
                        Vulnerability Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Continuous CVE monitoring, SLA tracking, and prioritized patching.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                        Run Custom Scan
                    </button>
                    <button className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Live Threat Intel
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="glass-panel p-5 rounded-2xl flex flex-col border border-slate-800/50"
                    >
                        <span className="text-sm font-medium text-slate-500 mb-2">{s.label}</span>
                        <div className="flex items-end space-x-3">
                            <span className="text-4xl font-bold text-slate-100 tracking-tighter">{s.count}</span>
                            <span className={cn("text-sm font-medium flex items-center mb-1", s.isGood ? "text-emerald-400" : "text-red-400")}>
                                {s.isGood ? <TrendingDown className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                                {s.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Row 2: Burndown Chart + Severity Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vulnerability Burndown */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Vulnerability Burndown</h3>
                        </div>
                        <span className="text-xs text-slate-500">Last 6 months</span>
                    </div>
                    <div className="flex-1 flex items-end space-x-4 min-h-[200px] px-2">
                        {burndownData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                                <div className="w-full flex space-x-1 items-end" style={{ height: "180px" }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.open / maxVal) * 100}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.1 }}
                                        className="flex-1 bg-red-500/30 rounded-t-md border border-red-500/20"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.closed / maxVal) * 100}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.1 + 0.1 }}
                                        className="flex-1 bg-emerald-500/30 rounded-t-md border border-emerald-500/20"
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">{d.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center space-x-6 mt-4 pt-3 border-t border-slate-800/50">
                        <div className="flex items-center space-x-2"><div className="w-3 h-2 rounded-sm bg-red-500/30 border border-red-500/20" /><span className="text-[10px] text-slate-400">Open</span></div>
                        <div className="flex items-center space-x-2"><div className="w-3 h-2 rounded-sm bg-emerald-500/30 border border-emerald-500/20" /><span className="text-[10px] text-slate-400">Closed</span></div>
                    </div>
                </div>

                {/* Severity Breakdown */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center space-x-2 mb-5">
                        <Target className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-slate-100">Severity Breakdown</h3>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-32 h-32">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {(() => {
                                    let offset = 0;
                                    const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#64748b"];
                                    return severityBreakdown.map((s, i) => {
                                        const dash = s.pct;
                                        const el = (
                                            <circle
                                                key={i}
                                                cx="18" cy="18" r="15.915"
                                                fill="none"
                                                stroke={colors[i]}
                                                strokeWidth="3.5"
                                                strokeDasharray={`${dash} ${100 - dash}`}
                                                strokeDashoffset={`${-offset}`}
                                                className="transition-all duration-300"
                                            />
                                        );
                                        offset += dash;
                                        return el;
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-slate-100">150</span>
                                <span className="text-[9px] uppercase tracking-widest text-slate-500">Total</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 flex-1">
                        {severityBreakdown.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                    <div className={cn("w-2.5 h-2.5 rounded-full", s.color)} />
                                    <span className="text-slate-300">{s.label}</span>
                                </div>
                                <span className="text-slate-500 font-mono">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Top CVEs Table + Pending Patches */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Top CVEs */}
                <div className="xl:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                            <Bug className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-semibold text-slate-100">Priority CVEs</h3>
                        </div>
                        <button className="text-xs text-slate-400 hover:text-slate-200 flex items-center transition-colors">View All <ChevronRight className="w-3 h-3 ml-1" /></button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">CVE ID</th>
                                    <th className="px-4 py-3 font-medium">CVSS</th>
                                    <th className="px-4 py-3 font-medium">Product</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg">SLA</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {topCVEs.map((cve) => (
                                    <tr key={cve.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 py-3 font-mono text-xs text-red-400 group-hover:text-red-300 transition-colors flex items-center">
                                            {cve.id}
                                            <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-0.5 rounded",
                                                cve.cvss >= 9 ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                                            )}>{cve.cvss}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-300">{cve.product}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex items-center w-max gap-1",
                                                cve.status === "Mitigated" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    cve.status === "Patching" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                        cve.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            cve.status === "Verifying" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                                                "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                            )}>
                                                {cve.status === "Mitigated" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {cve.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{cve.sla}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Patches */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 flex flex-col">
                    <div className="flex items-center space-x-2 mb-5">
                        <GitPullRequest className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-slate-100">Pending Patches</h3>
                    </div>
                    <div className="flex flex-col space-y-3 flex-1">
                        {pendingPatches.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors font-mono">{p.package}</span>
                                    <span className={cn(
                                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                        p.priority === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                            p.priority === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    )}>{p.priority}</span>
                                </div>
                                <div className="flex items-center text-[10px] text-slate-500 space-x-2">
                                    <span className="font-mono">{p.current}</span>
                                    <span>→</span>
                                    <span className="font-mono text-emerald-400">{p.target}</span>
                                    <span className="ml-auto">{p.affected} hosts</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <button className="w-full mt-3 shrink-0 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-sm font-medium text-blue-400 py-2.5 rounded-lg border border-blue-500/20 transition-colors">
                        <Zap className="w-4 h-4 mr-2" />
                        Auto-Approve Safe Patches
                    </button>
                </div>
            </div>
        </div>
    );
}
