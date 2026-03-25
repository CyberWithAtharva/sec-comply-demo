"use client";

import React, { useState } from "react";
import {
    ClipboardList, Target, CheckCircle2, AlertTriangle, XCircle,
    ChevronRight, ChevronDown, BarChart3, Layers,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

interface DomainSection {
    label: string;
    total: number;
    fulfilled: number;
}

interface Framework {
    id: string;
    name: string;
    version: string;
}

interface ControlRequirementsClientProps {
    orgId: string;
    totalControls: number;
    fulfilledControls: number;
    overallScore: number;
    autoFulfilled: number;
    criticalPending: number;
    notStarted: number;
    evidencePending: number;
    frameworks: Framework[];
    domainSections: DomainSection[];
}

const TABS = ["Overview", "Questions", "All Controls"] as const;

export function ControlRequirementsClient({
    totalControls,
    fulfilledControls,
    overallScore,
    autoFulfilled,
    criticalPending,
    notStarted,
    evidencePending,
    frameworks,
    domainSections,
}: ControlRequirementsClientProps) {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");
    const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

    const toggleDomain = (label: string) => {
        setExpandedDomains(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
    };

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (overallScore / 100) * circumference;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <ClipboardList className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Control Requirements</h1>
                        <p className="text-sm text-slate-400 mt-0.5">Track your compliance posture and answer gap assessment questions</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                            activeTab === tab
                                ? "border-orange-500 text-orange-400"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === "Overview" && (
                <div className="space-y-5">
                    {/* Overall compliance hero card */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-8">
                            {/* Circular progress */}
                            <div className="relative flex-shrink-0">
                                <svg width="140" height="140" viewBox="0 0 140 140">
                                    <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
                                    <circle
                                        cx="70" cy="70" r={radius}
                                        fill="none"
                                        stroke={overallScore >= 80 ? "#10b981" : overallScore >= 40 ? "#f59e0b" : "#ef4444"}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                        transform="rotate(-90 70 70)"
                                    />
                                    <text x="70" y="65" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{overallScore}%</text>
                                    <text x="70" y="82" textAnchor="middle" fill="#64748b" fontSize="10">overall</text>
                                </svg>
                            </div>

                            <div className="flex-1">
                                <p className="text-2xl font-bold text-white mb-1">
                                    {fulfilledControls} of {totalControls} controls fulfilled
                                </p>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="flex items-center gap-1.5 text-xs text-red-400">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        {criticalPending} Critical Pending
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-amber-400">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                        {evidencePending} Evidence Pending
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                                        {notStarted} Not Started
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        {autoFulfilled} Auto-Fulfilled
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Overall Score", value: `${overallScore}%`, icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                            { label: "Auto-Fulfilled", value: autoFulfilled, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                            { label: "Critical Pending", value: criticalPending, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                            { label: "Not Started", value: notStarted, icon: XCircle, color: "text-slate-400", bg: "bg-slate-800/50 border-slate-700/50" },
                        ].map(stat => (
                            <div key={stat.label} className={cn("bg-slate-900/60 border rounded-xl p-4", stat.bg.split(" ")[1] ? "border-slate-800" : "")}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</span>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Section Coverage */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-semibold text-slate-200">Section Coverage</span>
                            </div>
                            <div className="flex gap-3 text-xs text-slate-500">
                                <span>Select source ↕ Highest</span>
                            </div>
                        </div>

                        {domainSections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Target className="w-10 h-10 text-slate-700 mb-3" />
                                <p className="text-slate-400 text-sm">No control sections found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/60">
                                {domainSections.map(domain => {
                                    const pct = domain.total > 0 ? Math.round((domain.fulfilled / domain.total) * 100) : 0;
                                    const isExpanded = expandedDomains.has(domain.label);
                                    return (
                                        <div key={domain.label}>
                                            <button
                                                onClick={() => toggleDomain(domain.label)}
                                                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition-colors text-left"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-slate-200 truncate">{domain.label}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32 bg-slate-800 rounded-full h-1.5">
                                                        <div
                                                            className={cn(
                                                                "h-1.5 rounded-full",
                                                                pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                                                            )}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-400 w-12 text-right">{domain.fulfilled}/{domain.total}</span>
                                                    <span className={cn(
                                                        "text-xs font-semibold w-10 text-right",
                                                        pct >= 80 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400"
                                                    )}>{pct}%</span>
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Frameworks */}
                    {frameworks.length > 0 && (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                            <p className="text-sm font-semibold text-slate-200 mb-3">Active Frameworks</p>
                            <div className="flex flex-wrap gap-2">
                                {frameworks.map(fw => (
                                    <span key={fw.id} className="px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium">
                                        {fw.name} {fw.version && `v${fw.version}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Questions" && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ClipboardList className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-300 font-medium">Gap assessment questionnaire</p>
                    <p className="text-slate-500 text-sm mt-1">Answer control questions to improve your compliance score</p>
                </div>
            )}

            {activeTab === "All Controls" && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Layers className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-300 font-medium">All {totalControls} controls</p>
                    <p className="text-slate-500 text-sm mt-1">Full control list view coming soon</p>
                </div>
            )}
        </div>
    );
}
