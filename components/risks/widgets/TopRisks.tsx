"use client";

import React from "react";
import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Top Risks by Score
                </h3>
                <Button
                    variant="link"
                    onClick={onJump}
                    className="h-auto p-0 gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:no-underline"
                >
                    View register <ArrowRight className="w-3 h-3" />
                </Button>
            </div>

            {top.length === 0 ? (
                <p className="text-xs text-muted-foreground/70 py-6 text-center">No active risks.</p>
            ) : (
                <ul className="space-y-2">
                    {top.map(r => {
                        const sev = severityFromScore(r.risk_score);
                        const status = (r.status as RiskStatus) ?? "open";
                        return (
                            <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/40 border border-border/40">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">{r.title}</p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
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
