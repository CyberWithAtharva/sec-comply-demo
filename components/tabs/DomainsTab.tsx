"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, ShieldAlert, ShieldCheck, ChevronDown, CheckCircle2, AlertTriangle, FileText,
    TrendingUp, TrendingDown, BarChart3, AlertCircle, ArrowUpRight, Target, Activity,
    Clock, Eye, Layers, Zap, RotateCcw
} from "lucide-react";
import { cn } from "@/components/ui/Card";

export function DomainsTab({ frameworkId }: { frameworkId: string }) {
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const getMultiplier = (id: string) => (id === "iso27001" ? 1.1 : id === "dpd" ? 0.9 : 1);
    const m = getMultiplier(frameworkId);

    const domains = [
        {
            name: "Security", score: Math.min(100, Math.round(85 * m)), status: "Good" as const, trend: +3,
            subcategories: [
                { name: "Access Control", controls: 8, passed: 7, evidence: 12, risk: "Low" },
                { name: "Encryption", controls: 5, passed: 5, evidence: 8, risk: "None" },
                { name: "Network Security", controls: 6, passed: 4, evidence: 9, risk: "Medium" },
                { name: "Incident Response", controls: 4, passed: 3, evidence: 6, risk: "Medium" },
            ],
            recentFindings: [
                { desc: "MFA not enforced on 3 admin accounts", severity: "High", age: "2d" },
                { desc: "Firewall rule #47 allows 0.0.0.0/0 ingress", severity: "Critical", age: "5h" },
            ],
            remediations: [
                { task: "Enforce MFA for all admins", assignee: "IT Ops", due: "Feb 28", status: "In Progress" },
                { task: "Restrict firewall ingress", assignee: "NetSec", due: "Feb 25", status: "Open" },
                { task: "Rotate expired SSH keys", assignee: "DevOps", due: "Mar 1", status: "Done" },
            ],
        },
        {
            name: "Availability", score: Math.min(100, Math.round(92 * m)), status: "Good" as const, trend: +5,
            subcategories: [
                { name: "Uptime SLA", controls: 3, passed: 3, evidence: 5, risk: "None" },
                { name: "Disaster Recovery", controls: 4, passed: 4, evidence: 7, risk: "None" },
                { name: "Capacity Planning", controls: 3, passed: 2, evidence: 4, risk: "Low" },
            ],
            recentFindings: [
                { desc: "DR failover test overdue by 2 weeks", severity: "Medium", age: "14d" },
            ],
            remediations: [
                { task: "Schedule DR failover test", assignee: "SRE", due: "Feb 26", status: "In Progress" },
                { task: "Update capacity forecast Q2", assignee: "Infra", due: "Mar 5", status: "Open" },
            ],
        },
        {
            name: "Processing Integrity", score: Math.min(100, Math.round(68 * m)), status: "Warning" as const, trend: -2,
            subcategories: [
                { name: "Data Validation", controls: 5, passed: 3, evidence: 4, risk: "High" },
                { name: "Error Handling", controls: 4, passed: 2, evidence: 3, risk: "High" },
                { name: "Monitoring", controls: 6, passed: 5, evidence: 8, risk: "Low" },
            ],
            recentFindings: [
                { desc: "Input validation bypass on /api/v2/import", severity: "Critical", age: "1d" },
                { desc: "Error logs not aggregated for batch jobs", severity: "High", age: "3d" },
                { desc: "Missing integrity check on financial reports", severity: "High", age: "7d" },
            ],
            remediations: [
                { task: "Patch import API validation", assignee: "Backend", due: "Feb 24", status: "In Progress" },
                { task: "Setup ELK for batch error logs", assignee: "Platform", due: "Mar 3", status: "Open" },
                { task: "Add checksum to report exports", assignee: "Backend", due: "Mar 10", status: "Open" },
            ],
        },
        {
            name: "Confidentiality", score: Math.min(100, Math.round(45 * m)), status: "Critical" as const, trend: -8,
            subcategories: [
                { name: "Data Classification", controls: 4, passed: 1, evidence: 2, risk: "Critical" },
                { name: "Data Loss Prevention", controls: 5, passed: 2, evidence: 3, risk: "High" },
                { name: "Key Management", controls: 3, passed: 2, evidence: 4, risk: "Medium" },
            ],
            recentFindings: [
                { desc: "PII exposed in staging logs", severity: "Critical", age: "6h" },
                { desc: "DLP not enabled for Google Drive", severity: "High", age: "2d" },
                { desc: "Encryption keys not rotated in 180 days", severity: "High", age: "12d" },
            ],
            remediations: [
                { task: "Sanitize staging log pipeline", assignee: "Platform", due: "Feb 24", status: "In Progress" },
                { task: "Enable DLP for GSuite", assignee: "SecOps", due: "Feb 28", status: "Open" },
                { task: "Automate key rotation", assignee: "DevOps", due: "Mar 5", status: "Open" },
                { task: "Classify all S3 buckets", assignee: "Data Eng", due: "Mar 15", status: "Open" },
            ],
        },
        {
            name: "Privacy", score: Math.min(100, Math.round(98 * m)), status: "Good" as const, trend: +1,
            subcategories: [
                { name: "Consent Management", controls: 4, passed: 4, evidence: 6, risk: "None" },
                { name: "Data Retention", controls: 3, passed: 3, evidence: 5, risk: "None" },
                { name: "Subject Rights", controls: 5, passed: 5, evidence: 7, risk: "None" },
            ],
            recentFindings: [],
            remediations: [
                { task: "Annual privacy impact assessment", assignee: "Legal", due: "Mar 30", status: "Open" },
            ],
        },
    ];

    // Aggregate stats
    const totalControls = domains.reduce((a, d) => a + d.subcategories.reduce((b, s) => b + s.controls, 0), 0);
    const totalPassed = domains.reduce((a, d) => a + d.subcategories.reduce((b, s) => b + s.passed, 0), 0);
    const totalEvidence = domains.reduce((a, d) => a + d.subcategories.reduce((b, s) => b + s.evidence, 0), 0);
    const totalFindings = domains.reduce((a, d) => a + d.recentFindings.length, 0);
    const criticalCount = domains.reduce((a, d) => a + d.recentFindings.filter(f => f.severity === "Critical").length, 0);
    const avgScore = Math.round(domains.reduce((a, d) => a + d.score, 0) / domains.length);

    return (
        <motion.div
            key="domains"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* ─── W1: Aggregate Stats Row ─────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Overall Score", value: `${avgScore}%`, icon: Target, color: avgScore >= 80 ? "emerald" : avgScore >= 60 ? "amber" : "red" },
                    { label: "Controls Passed", value: `${totalPassed}/${totalControls}`, icon: CheckCircle2, color: "emerald" },
                    { label: "Evidence Linked", value: `${totalEvidence}`, icon: FileText, color: "blue" },
                    { label: "Open Findings", value: `${totalFindings}`, icon: AlertTriangle, color: totalFindings > 5 ? "red" : "amber" },
                    { label: "Critical Issues", value: `${criticalCount}`, icon: AlertCircle, color: criticalCount > 0 ? "red" : "emerald" },
                    { label: "Domains Healthy", value: `${domains.filter(d => d.status === "Good").length}/${domains.length}`, icon: ShieldCheck, color: "emerald" },
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

            {/* ─── W2: Domain Score Cards (expandable) ─────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((domain, i) => {
                    const isExpanded = expandedDomain === domain.name;
                    const totalCtrl = domain.subcategories.reduce((a, s) => a + s.controls, 0);
                    const passedCtrl = domain.subcategories.reduce((a, s) => a + s.passed, 0);
                    const evidenceCtrl = domain.subcategories.reduce((a, s) => a + s.evidence, 0);
                    return (
                        <div key={i} className="flex flex-col">
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
                                    <h3 className="text-base font-semibold text-slate-200">{domain.name}</h3>
                                    <div className={cn("flex items-center text-xs font-semibold",
                                        domain.trend > 0 ? "text-emerald-400" : domain.trend < 0 ? "text-red-400" : "text-slate-500"
                                    )}>
                                        {domain.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : domain.trend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                                        {domain.trend > 0 ? "+" : ""}{domain.trend}%
                                    </div>
                                </div>

                                <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${domain.score}%` }}
                                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                        className={cn(
                                            "h-full rounded-full",
                                            domain.status === "Good" ? "bg-emerald-500" :
                                                domain.status === "Warning" ? "bg-amber-500" :
                                                    "bg-red-500"
                                        )}
                                    />
                                </div>

                                {/* W3: Quick stats bar */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50 text-[10px]">
                                    <span className="text-slate-500">{domain.subcategories.length} subcategories</span>
                                    <span className="text-slate-500">{totalCtrl} controls</span>
                                    <span className="text-slate-500">{evidenceCtrl} evidence</span>
                                </div>
                            </div>

                            {/* ─── W4: Expanded Detail Panel ──────────────── */}
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
                                            {/* W5: Subcategory Breakdown */}
                                            <div>
                                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Subcategory Breakdown</span>
                                                <div className="space-y-2">
                                                    {domain.subcategories.map((sub, j) => {
                                                        const pct = Math.round((sub.passed / sub.controls) * 100);
                                                        return (
                                                            <div key={j} className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                                                                <div className="flex items-center space-x-2">
                                                                    {pct === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                                                                    <span className="text-xs font-medium text-slate-200">{sub.name}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-4 text-[10px] text-slate-500">
                                                                    <span className={cn(
                                                                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                                                                        sub.risk === "None" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                                            sub.risk === "Low" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                                                sub.risk === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                                                    sub.risk === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                                                    )}>{sub.risk}</span>
                                                                    <span className={cn("font-bold", pct >= 90 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400")}>{pct}%</span>
                                                                    <span>{sub.passed}/{sub.controls} controls</span>
                                                                    <span className="flex items-center"><FileText className="w-2.5 h-2.5 mr-0.5" />{sub.evidence}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* W6 + W7: Findings + Remediations side-by-side */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* W6: Recent Findings */}
                                                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <Eye className="w-4 h-4 text-red-400" />
                                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent Findings</span>
                                                        {domain.recentFindings.length > 0 && (
                                                            <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                                                {domain.recentFindings.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {domain.recentFindings.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {domain.recentFindings.map((f, k) => (
                                                                <div key={k} className="flex items-start space-x-2 text-xs">
                                                                    <span className={cn(
                                                                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border mt-0.5 flex-shrink-0",
                                                                        f.severity === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                                            f.severity === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                    )}>{f.severity}</span>
                                                                    <span className="text-slate-300 leading-relaxed">{f.desc}</span>
                                                                    <span className="text-slate-600 flex-shrink-0">{f.age}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-emerald-400/70 italic">No open findings — clean domain ✓</p>
                                                    )}
                                                </div>

                                                {/* W7: Remediation Tracker */}
                                                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <RotateCcw className="w-4 h-4 text-blue-400" />
                                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Remediation Plan</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {domain.remediations.map((r, k) => (
                                                            <div key={k} className="flex items-center justify-between text-xs p-2 bg-slate-800/40 rounded-lg">
                                                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                                    <span className={cn(
                                                                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                                                        r.status === "Done" ? "bg-emerald-400" :
                                                                            r.status === "In Progress" ? "bg-blue-400" :
                                                                                "bg-slate-500"
                                                                    )} />
                                                                    <span className="text-slate-300 truncate">{r.task}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                                                                    <span className="text-slate-500">{r.assignee}</span>
                                                                    <span className="text-slate-600 flex items-center"><Clock className="w-2.5 h-2.5 mr-0.5" />{r.due}</span>
                                                                    <span className={cn(
                                                                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                                                        r.status === "Done" ? "text-emerald-400 bg-emerald-500/10" :
                                                                            r.status === "In Progress" ? "text-blue-400 bg-blue-500/10" :
                                                                                "text-slate-400 bg-slate-500/10"
                                                                    )}>{r.status}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* W8: Control Coverage Bar */}
                                            <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Layers className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Control Coverage</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {domain.subcategories.map((sub, j) => {
                                                        const pct = Math.round((sub.passed / sub.controls) * 100);
                                                        return (
                                                            <div key={j}>
                                                                <div className="flex justify-between text-[11px] mb-1">
                                                                    <span className="text-slate-300 font-medium">{sub.name}</span>
                                                                    <span className={cn("font-bold", pct === 100 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400")}>
                                                                        {pct}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${pct}%` }}
                                                                        transition={{ duration: 0.8, delay: j * 0.1 }}
                                                                        className={cn(
                                                                            "h-full rounded-full",
                                                                            pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"
                                                                        )}
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

            {/* ─── W9: Cross-Domain Risk Matrix ────────────────────── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Cross-Domain Risk Matrix</h3>
                </div>
                <div className="grid grid-cols-6 gap-1.5 text-center">
                    {/* Header */}
                    <div className="text-[9px] font-medium text-slate-600" />
                    {["Access", "Data", "Network", "Ops", "Compliance"].map(h => (
                        <div key={h} className="text-[9px] font-medium text-slate-500 uppercase">{h}</div>
                    ))}
                    {/* Rows */}
                    {domains.map((d, di) => (
                        <React.Fragment key={d.name}>
                            <div className="text-[10px] font-semibold text-slate-300 flex items-center justify-end pr-2 truncate">{d.name}</div>
                            {[0, 1, 2, 3, 4].map(ci => {
                                const seed = (di * 31 + ci * 17 + d.score) % 100;
                                const level = seed > 75 ? "Strong" : seed > 50 ? "Good" : seed > 30 ? "Partial" : seed > 15 ? "Weak" : "Gap";
                                const cls = level === "Strong" ? "bg-emerald-500/70 text-emerald-50" :
                                    level === "Good" ? "bg-emerald-600/50 text-emerald-100" :
                                        level === "Partial" ? "bg-teal-600/40 text-teal-100" :
                                            level === "Weak" ? "bg-amber-500/40 text-amber-100" :
                                                "bg-red-500/30 text-red-200";
                                return (
                                    <div key={ci} className={cn("rounded-md h-8 flex items-center justify-center text-[9px] font-bold", cls)}>
                                        {level}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ─── W10: Domain Comparison Table ────────────────────── */}
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
                                <th className="px-4 py-3 font-medium text-center">Trend</th>
                                <th className="px-4 py-3 font-medium text-center">Controls</th>
                                <th className="px-4 py-3 font-medium text-center">Findings</th>
                                <th className="px-4 py-3 font-medium text-center">Remediations</th>
                                <th className="px-4 py-3 font-medium text-center rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {domains.map((d) => {
                                const tc = d.subcategories.reduce((a, s) => a + s.controls, 0);
                                const tp = d.subcategories.reduce((a, s) => a + s.passed, 0);
                                return (
                                    <tr key={d.name} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3 text-slate-200 font-medium">{d.name}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn("font-bold", d.score >= 80 ? "text-emerald-400" : d.score >= 60 ? "text-amber-400" : "text-red-400")}>{d.score}%</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn("text-xs font-semibold flex items-center justify-center",
                                                d.trend > 0 ? "text-emerald-400" : d.trend < 0 ? "text-red-400" : "text-slate-500"
                                            )}>
                                                {d.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : d.trend < 0 ? <TrendingDown className="w-3 h-3" /> : "—"}
                                                {d.trend !== 0 && <span className="ml-0.5">{Math.abs(d.trend)}%</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-400 text-xs">{tp}/{tc}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn("text-xs font-bold", d.recentFindings.length > 2 ? "text-red-400" : d.recentFindings.length > 0 ? "text-amber-400" : "text-emerald-400")}>
                                                {d.recentFindings.length}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-400 text-xs">
                                            {d.remediations.filter(r => r.status !== "Done").length} active
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                                                d.status === "Good" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    d.status === "Warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>{d.status}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
