"use client";

import React from "react";
import { Clock } from "lucide-react";
import type { RiskRow, StatusHistoryRow } from "../types";

interface Props {
    history: StatusHistoryRow[];
    risks: RiskRow[];
}

export function RecentActivityFeed({ history, risks }: Props) {
    const riskTitleById = new Map(risks.map(r => [r.id, r.title]));
    const recent = history.slice(0, 10);

    return (
        <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Recent Activity
            </h3>

            {recent.length === 0 ? (
                <p className="text-xs text-muted-foreground/70 text-center py-6">No activity recorded yet.</p>
            ) : (
                <ul className="space-y-2.5">
                    {recent.map(h => {
                        const title = riskTitleById.get(h.risk_id) ?? "Removed risk";
                        return (
                            <li key={h.id} className="flex items-start gap-3 text-xs">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-muted-foreground truncate">
                                        <span className="text-muted-foreground">{h.field}:</span>{" "}
                                        <span className="text-muted-foreground">{h.from_value ?? "—"}</span>
                                        <span className="text-muted-foreground/70 mx-1">→</span>
                                        <span className="text-foreground">{h.to_value ?? "—"}</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">{title}</p>
                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                        {h.profiles?.full_name ?? "System"} · {new Date(h.changed_at).toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
