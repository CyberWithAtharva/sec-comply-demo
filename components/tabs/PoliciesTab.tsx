"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, MoreVertical, CheckCircle2, Clock, ChevronDown, Shield, Users, History,
    Link, AlertCircle, BarChart3, Calendar, BookOpen, AlertTriangle, ArrowUpRight,
    Eye, Layers, Target, RefreshCw, XCircle
} from "lucide-react";
import { cn } from "@/components/ui/Card";

export function PoliciesTab({ frameworkId }: { frameworkId: string }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const policies = [
        {
            id: "POL-01", title: `${frameworkId.toUpperCase()} Information Security Policy`, status: "Approved", updated: "2 days ago", owner: "SecOps",
            nextReview: "Jun 2026", coverage: 92, category: "Security",
            details: {
                version: "3.2", approvers: ["CISO", "CTO", "Head of Engineering"],
                linkedControls: ["CC1.1", "CC1.2", "CC1.3", "CC6.1"],
                history: [
                    { version: "3.2", date: "2 days ago", action: "Minor update — encryption standards" },
                    { version: "3.1", date: "2 months ago", action: "Annual review completed" },
                    { version: "3.0", date: "8 months ago", action: "Major revision — cloud controls" },
                ],
                exceptions: [{ desc: "Legacy app exempted from TLS 1.3", risk: "Medium", expires: "30 days" }],
                gaps: ["Missing mobile device management section", "BYOD policy not addressed"],
            }
        },
        {
            id: "POL-02", title: "Access Control Policy", status: frameworkId === "dpd" ? "Approved" : "Under Review", updated: "5 hours ago", owner: "IT Admin",
            nextReview: "Apr 2026", coverage: 78, category: "Access",
            details: {
                version: "2.1", approvers: ["CISO", "IT Director"],
                linkedControls: ["CC6.1", "CC6.2", "CC6.3"],
                history: [
                    { version: "2.1", date: "5 hours ago", action: "Added MFA requirements for contractors" },
                    { version: "2.0", date: "4 months ago", action: "Revised least-privilege guidelines" },
                ],
                exceptions: [{ desc: "Shared service account allowed for CI/CD", risk: "High", expires: "14 days" }],
                gaps: ["No privileged access workstation (PAW) requirements", "Missing break-glass procedure"],
            }
        },
        {
            id: "POL-03", title: "Incident Response Plan", status: "Approved", updated: "1 month ago", owner: "SecOps",
            nextReview: "Jul 2026", coverage: 95, category: "Operations",
            details: {
                version: "4.0", approvers: ["CISO", "VP Engineering", "Legal"],
                linkedControls: ["CC7.1", "CC7.2", "CC7.3", "CC7.4", "CC7.5"],
                history: [
                    { version: "4.0", date: "1 month ago", action: "Added ransomware playbook" },
                    { version: "3.5", date: "6 months ago", action: "Updated escalation matrix" },
                ],
                exceptions: [],
                gaps: [],
            }
        },
        {
            id: "POL-04", title: "Data Retention Policy", status: "Draft", updated: "10 mins ago", owner: "Legal",
            nextReview: "TBD", coverage: 25, category: "Data",
            details: {
                version: "1.0-draft", approvers: [],
                linkedControls: ["CC8.1"],
                history: [{ version: "1.0-draft", date: "10 mins ago", action: "Initial draft created" }],
                exceptions: [],
                gaps: ["No retention periods defined for logs", "Missing PII disposal workflow", "Cloud data residency not addressed", "Backup lifecycle not specified"],
            }
        },
        {
            id: "POL-05", title: "Vendor Risk Management", status: "Approved", updated: "3 months ago", owner: "Procurement",
            nextReview: "Sep 2026", coverage: 88, category: "Vendor",
            details: {
                version: "2.3", approvers: ["CISO", "CFO", "Procurement Lead"],
                linkedControls: ["CC9.1", "CC9.2"],
                history: [
                    { version: "2.3", date: "3 months ago", action: "Added tiering criteria update" },
                    { version: "2.2", date: "9 months ago", action: "SOC 2 requirement for Tier 1" },
                ],
                exceptions: [{ desc: "Small vendor <$10k exempt from SOC 2 requirement", risk: "Low", expires: "90 days" }],
                gaps: ["Missing 4th-party risk assessment process"],
            }
        },
        {
            id: "POL-06", title: "Change Management Policy", status: "Approved", updated: "2 weeks ago", owner: "Engineering",
            nextReview: "May 2026", coverage: 82, category: "Operations",
            details: {
                version: "3.1", approvers: ["VP Engineering", "CTO"],
                linkedControls: ["CC5.1", "CC5.2", "CC5.4"],
                history: [
                    { version: "3.1", date: "2 weeks ago", action: "Updated CAB process for emergency changes" },
                    { version: "3.0", date: "5 months ago", action: "Added automated deployment gates" },
                ],
                exceptions: [{ desc: "Hotfix deployments bypass standard CAB review", risk: "Medium", expires: "60 days" }],
                gaps: ["Missing rollback SLA definitions"],
            }
        },
        {
            id: "POL-07", title: "Business Continuity Plan", status: "Under Review", updated: "1 week ago", owner: "Ops",
            nextReview: "Mar 2026", coverage: 68, category: "Operations",
            details: {
                version: "2.0-rc", approvers: ["COO"],
                linkedControls: ["A1.1", "A1.2", "A1.3"],
                history: [
                    { version: "2.0-rc", date: "1 week ago", action: "Complete rewrite for multi-region" },
                ],
                exceptions: [],
                gaps: ["Communication plan during outages not documented", "No tabletop exercise schedule"],
            }
        },
    ];

    // Aggregate stats
    const approved = policies.filter(p => p.status === "Approved").length;
    const underReview = policies.filter(p => p.status === "Under Review").length;
    const draft = policies.filter(p => p.status === "Draft").length;
    const avgCoverage = Math.round(policies.reduce((a, p) => a + p.coverage, 0) / policies.length);
    const totalExceptions = policies.reduce((a, p) => a + p.details.exceptions.length, 0);
    const totalGaps = policies.reduce((a, p) => a + p.details.gaps.length, 0);

    return (
        <motion.div
            key="policies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* ─── W1: Aggregate Stats Row ─────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Total Policies", value: policies.length, icon: BookOpen, color: "blue" },
                    { label: "Approved", value: approved, icon: CheckCircle2, color: "emerald" },
                    { label: "Under Review", value: underReview, icon: Clock, color: "amber" },
                    { label: "Draft", value: draft, icon: FileText, color: "slate" },
                    { label: "Avg Coverage", value: `${avgCoverage}%`, icon: Target, color: avgCoverage >= 80 ? "emerald" : "amber" },
                    { label: "Open Gaps", value: totalGaps, icon: AlertTriangle, color: totalGaps > 5 ? "red" : "amber" },
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

            {/* ─── W2: Approval Pipeline Visual ────────────────────── */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/50">
                <div className="flex items-center space-x-2 mb-4">
                    <RefreshCw className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Approval Pipeline</span>
                </div>
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

            {/* ─── W3: Policy Table (expandable) ───────────────────── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
                    <h3 className="text-lg font-semibold text-slate-100">Governing Standards</h3>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        Add Policy
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/40">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                                <th className="px-4 py-3 font-medium">Policy Name</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium text-center">Coverage</th>
                                <th className="px-4 py-3 font-medium">Owner</th>
                                <th className="px-4 py-3 font-medium">Next Review</th>
                                <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {policies.map((pol) => {
                                const isExpanded = expandedId === pol.id;
                                return (
                                    <React.Fragment key={pol.id}>
                                        <tr
                                            onClick={() => setExpandedId(isExpanded ? null : pol.id)}
                                            className={cn("transition-colors group cursor-pointer", isExpanded ? "bg-blue-500/[0.03]" : "hover:bg-slate-800/30")}
                                        >
                                            <td className="px-4 py-3 font-mono text-slate-300 text-xs">{pol.id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{pol.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border flex items-center w-max gap-1",
                                                    pol.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        pol.status === "Under Review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                )}>
                                                    {pol.status === "Approved" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                                    {pol.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{pol.category}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-16 bg-slate-800/60 rounded-full h-1 overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full", pol.coverage >= 80 ? "bg-emerald-500" : pol.coverage >= 50 ? "bg-amber-500" : "bg-red-500")}
                                                            style={{ width: `${pol.coverage}%` }}
                                                        />
                                                    </div>
                                                    <span className={cn("text-[10px] font-bold", pol.coverage >= 80 ? "text-emerald-400" : pol.coverage >= 50 ? "text-amber-400" : "text-red-400")}>
                                                        {pol.coverage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-xs">{pol.owner}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{pol.nextReview}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <span className="text-xs text-slate-500">{pol.updated}</span>
                                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                        <ChevronDown className={cn("w-4 h-4", isExpanded ? "text-blue-400" : "text-slate-500")} />
                                                    </motion.div>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* ─── W4-W8: Expanded Row Detail ──── */}
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
                                                                {/* Row 1: Approvers + Linked Controls + Version History */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {/* W4: Approvers */}
                                                                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                            <Users className="w-4 h-4 text-blue-400" />
                                                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Approvers</span>
                                                                        </div>
                                                                        <div className="flex flex-col space-y-1.5">
                                                                            {pol.details.approvers.length > 0 ? pol.details.approvers.map((a, i) => (
                                                                                <div key={i} className="flex items-center space-x-2 text-xs text-slate-400">
                                                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                                                    <span>{a}</span>
                                                                                </div>
                                                                            )) : <span className="text-xs text-slate-500 italic">Pending approval</span>}
                                                                        </div>
                                                                        <div className="mt-3 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500">
                                                                            Version: <span className="text-slate-300 font-mono">{pol.details.version}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* W5: Linked Controls */}
                                                                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                            <Link className="w-4 h-4 text-emerald-400" />
                                                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Linked Controls</span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {pol.details.linkedControls.map((c, i) => (
                                                                                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{c}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* W6: Version History */}
                                                                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                            <History className="w-4 h-4 text-amber-400" />
                                                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">History</span>
                                                                        </div>
                                                                        <div className="flex flex-col space-y-2">
                                                                            {pol.details.history.map((h, i) => (
                                                                                <div key={i} className="flex flex-col text-[10px]">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span className="font-mono text-slate-300">v{h.version}</span>
                                                                                        <span className="text-slate-600">•</span>
                                                                                        <span className="text-slate-500">{h.date}</span>
                                                                                    </div>
                                                                                    <span className="text-slate-400 mt-0.5">{h.action}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Row 2: Exceptions + Gaps */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {/* W7: Exception Register */}
                                                                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                            <AlertCircle className="w-4 h-4 text-orange-400" />
                                                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Active Exceptions</span>
                                                                            {pol.details.exceptions.length > 0 && (
                                                                                <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                                                                    {pol.details.exceptions.length}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {pol.details.exceptions.length > 0 ? (
                                                                            <div className="space-y-2">
                                                                                {pol.details.exceptions.map((exc, k) => (
                                                                                    <div key={k} className="flex items-start justify-between text-xs p-2 bg-slate-800/40 rounded-lg">
                                                                                        <span className="text-slate-300 leading-relaxed pr-3">{exc.desc}</span>
                                                                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                                                                            <span className={cn(
                                                                                                "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                                                                                exc.risk === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                                                                    exc.risk === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                                                                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                                                            )}>{exc.risk}</span>
                                                                                            <span className="text-[10px] text-slate-500 flex items-center"><Clock className="w-2.5 h-2.5 mr-0.5" />{exc.expires}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-emerald-400/70 italic">No active exceptions ✓</p>
                                                                        )}
                                                                    </div>

                                                                    {/* W8: Gap Analysis */}
                                                                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4">
                                                                        <div className="flex items-center space-x-2 mb-3">
                                                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Policy Gaps</span>
                                                                            {pol.details.gaps.length > 0 && (
                                                                                <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                                                                    {pol.details.gaps.length}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {pol.details.gaps.length > 0 ? (
                                                                            <div className="space-y-1.5">
                                                                                {pol.details.gaps.map((gap, k) => (
                                                                                    <div key={k} className="flex items-start space-x-2 text-xs text-slate-400">
                                                                                        <XCircle className="w-3 h-3 text-red-400/60 mt-0.5 flex-shrink-0" />
                                                                                        <span className="leading-relaxed">{gap}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-emerald-400/70 italic">No gaps identified ✓</p>
                                                                        )}
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

            {/* ─── W9: Policy Coverage by Category ─────────────────── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Coverage by Category</h3>
                </div>
                <div className="space-y-3">
                    {Array.from(new Set(policies.map(p => p.category))).map((cat) => {
                        const catPolicies = policies.filter(p => p.category === cat);
                        const catAvg = Math.round(catPolicies.reduce((a, p) => a + p.coverage, 0) / catPolicies.length);
                        return (
                            <div key={cat}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-medium">{cat}</span>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-slate-500 text-[10px]">{catPolicies.length} {catPolicies.length === 1 ? "policy" : "policies"}</span>
                                        <span className={cn("font-bold text-[11px]", catAvg >= 80 ? "text-emerald-400" : catAvg >= 50 ? "text-amber-400" : "text-red-400")}>
                                            {catAvg}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${catAvg}%` }}
                                        transition={{ duration: 0.8 }}
                                        className={cn("h-full rounded-full", catAvg >= 80 ? "bg-emerald-500" : catAvg >= 50 ? "bg-amber-500" : "bg-red-500")}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ─── W10: Review Calendar ─────────────────────────────── */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/50">
                <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Upcoming Reviews</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {policies
                        .filter(p => p.nextReview !== "TBD")
                        .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
                        .map((pol) => (
                            <div key={pol.id} className="flex items-center space-x-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                                <div className={cn(
                                    "p-2 rounded-lg flex-shrink-0",
                                    pol.status === "Approved" ? "bg-emerald-500/10" : "bg-amber-500/10"
                                )}>
                                    <Calendar className={cn("w-4 h-4", pol.status === "Approved" ? "text-emerald-400" : "text-amber-400")} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-medium text-slate-200 truncate">{pol.title}</span>
                                    <span className="text-[10px] text-slate-500">{pol.nextReview}</span>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </motion.div>
    );
}
