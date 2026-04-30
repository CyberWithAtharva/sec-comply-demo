"use client";

import React from "react";
import { Flame, ArrowRight } from "lucide-react";
import { severityFromScore, STATUS_LABELS, STATUS_STYLES, isActive, type RiskStatus } from "@/lib/risk-styles";
import type { RiskRow } from "../types";

interface Props {
    risks: RiskRow[];
    onJump: () => void;
}

export function TopRisks({ risks, onJump }: Props) {
    const top = [...risks]
        .filter(r => isActive(r.status))
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 5);

    return (
        <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Top Risks by Score
                </h3>
                <button
                    onClick={onJump}
                    className="text-[11px] text-slate-500 hover:text-slate-200 flex items-center gap-1"
                >
                    View register <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {top.length === 0 ? (
                <p className="text-xs text-slate-600 py-6 text-center">No active risks.</p>
            ) : (
                <ul className="space-y-2">
                    {top.map(r => {
                        const sev = severityFromScore(r.risk_score);
                        const status = (r.status as RiskStatus) ?? "open";
                        return (
                            <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-200 truncate">{r.title}</p>
                                    <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                        {r.category}{r.profiles?.full_name ? ` · ${r.profiles.full_name}` : ""}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${sev.bg} ${sev.color} ${sev.border}`}>
                                        {r.risk_score}
                                    </span>
                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${STATUS_STYLES[status]}`}>
                                        {STATUS_LABELS[status]}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
