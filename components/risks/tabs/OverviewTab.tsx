"use client";

import React from "react";
import { RiskMatrix } from "../RiskMatrix";
import { RiskPostureSummary } from "../widgets/RiskPostureSummary";
import { TopRisks } from "../widgets/TopRisks";
import { FrameworkCoverage } from "../widgets/FrameworkCoverage";
import { RecentActivityFeed } from "../widgets/RecentActivityFeed";
import { isActive } from "@/lib/risk-styles";
import { DEMO_RISKS, DEMO_HISTORY } from "@/lib/risk-demo-data";
import type { RiskRow, StatusHistoryRow } from "../types";

interface Props {
    risks: RiskRow[];
    history: StatusHistoryRow[];
    nowMs: number;
    onJumpToTab: (tab: "overview" | "library" | "register") => void;
}

export function OverviewTab({ risks, history, nowMs, onJumpToTab }: Props) {
    // Demo mode: merge dummy risks + history into the Overview view so the dashboard
    // always looks populated. Other tabs continue to show real Supabase data only.
    const dashboardRisks = [...risks, ...DEMO_RISKS];
    const dashboardHistory = [...history, ...DEMO_HISTORY].sort(
        (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
    );
    const activeRisks = dashboardRisks.filter(r => isActive(r.status));

    return (
        <div className="space-y-6">
            <RiskPostureSummary risks={dashboardRisks} history={dashboardHistory} nowMs={nowMs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Heatmap */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Risk Heatmap</h3>
                        <div className="flex gap-3">
                            {[
                                { label: "Critical", color: "#ef4444" },
                                { label: "High",     color: "#f97316" },
                                { label: "Medium",   color: "#f59e0b" },
                                { label: "Low",      color: "#22c55e" },
                            ].map(({ label, color }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                    <span className="text-[10px] text-slate-500">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <RiskMatrix
                        risks={activeRisks}
                        onCellClick={() => onJumpToTab("register")}
                    />
                    <p className="text-[10px] text-slate-600 text-center mt-2">
                        Active risks (Open · In Progress) plotted by Likelihood × Impact. Click a cell to open the register.
                    </p>
                </div>

                {/* Top risks */}
                <TopRisks risks={dashboardRisks} onJump={() => onJumpToTab("register")} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FrameworkCoverage risks={dashboardRisks} />
                <RecentActivityFeed history={dashboardHistory} risks={dashboardRisks} />
            </div>
        </div>
    );
}
