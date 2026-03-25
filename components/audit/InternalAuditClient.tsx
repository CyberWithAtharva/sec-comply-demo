"use client";

import React, { useState } from "react";
import { ClipboardCheck, Plus, Calendar, Activity, CheckCircle2 } from "lucide-react";
import { cn } from "@/components/ui/Card";

const TABS = ["All", "Planned", "In Progress", "Completed"] as const;

interface InternalAuditClientProps {
    orgId: string;
}

export function InternalAuditClient({ orgId: _ }: InternalAuditClientProps) {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>("All");

    const tabCounts: Record<typeof TABS[number], number> = {
        "All": 0,
        "Planned": 0,
        "In Progress": 0,
        "Completed": 0,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <ClipboardCheck className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Internal Audit</h1>
                        <p className="text-sm text-slate-400 mt-0.5">Plan and execute internal compliance audits against your frameworks</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" />
                    New Audit
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                            activeTab === tab
                                ? "border-orange-500 text-orange-400"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {tab}
                        {tabCounts[tab] > 0 && (
                            <span className="text-xs bg-slate-800 text-slate-400 rounded px-1.5 py-0.5">{tabCounts[tab]}</span>
                        )}
                        {tabCounts[tab] === 0 && tab !== "All" && (
                            <span className="text-xs text-slate-600">0</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {tabCounts[activeTab] === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl">
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        {activeTab === "Completed" ? (
                            <CheckCircle2 className="w-12 h-12 text-slate-700 mb-4" />
                        ) : activeTab === "In Progress" ? (
                            <Activity className="w-12 h-12 text-slate-700 mb-4" />
                        ) : activeTab === "Planned" ? (
                            <Calendar className="w-12 h-12 text-slate-700 mb-4" />
                        ) : (
                            <ClipboardCheck className="w-12 h-12 text-slate-700 mb-4" />
                        )}
                        <p className="text-slate-400 text-sm font-medium">No audits yet</p>
                        {activeTab === "All" && (
                            <p className="text-slate-600 text-xs mt-1.5 max-w-xs">
                                Create your first audit to plan and track internal compliance reviews.
                            </p>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
