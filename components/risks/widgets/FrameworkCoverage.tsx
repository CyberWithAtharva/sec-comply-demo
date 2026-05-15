"use client";

import React, { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { FRAMEWORK_LABELS, FRAMEWORK_BADGE_COLORS, type Framework } from "@/lib/risk-library";
import { readFrameworkMappings } from "../types";
import { isActive } from "@/lib/risk-styles";
import type { RiskRow } from "../types";

interface Props {
    risks: RiskRow[];
}

const FRAMEWORKS: Framework[] = ["iso27001", "soc2", "hipaa", "gdpr", "dpdp"];

export function FrameworkCoverage({ risks }: Props) {
    const data = useMemo(() => {
        return FRAMEWORKS.map(fw => {
            const linked = risks.filter(r =>
                readFrameworkMappings(r.framework_mappings).some(m => m.framework === fw)
            );
            const total = linked.length;
            if (total === 0) {
                return { fw, total: 0, mitigated: 0, accepted: 0, open: 0, pct: 0 };
            }
            const mitigated = linked.filter(r => r.status === "mitigated").length;
            const accepted  = linked.filter(r => r.status === "accepted" || r.status === "transferred").length;
            const open      = linked.filter(r => isActive(r.status)).length;
            const closed    = linked.filter(r => r.status === "closed").length;
            const addressed = mitigated + accepted + closed;
            return { fw, total, mitigated, accepted, open, pct: total === 0 ? 0 : Math.round((addressed / total) * 100) };
        });
    }, [risks]);

    return (
        <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Framework Coverage
            </h3>

            <ul className="space-y-3">
                {data.map(d => (
                    <li key={d.fw}>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${FRAMEWORK_BADGE_COLORS[d.fw]}`}>
                                    {FRAMEWORK_LABELS[d.fw]}
                                </span>
                                <span className="text-[11px] text-muted-foreground">{d.total} risks linked</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">{d.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${d.pct}%`,
                                    background: d.pct >= 80 ? "#22c55e" : d.pct >= 50 ? "#f59e0b" : "#ef4444",
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                            <span>{d.open} open</span>
                            <span>·</span>
                            <span>{d.mitigated} mitigated</span>
                            <span>·</span>
                            <span>{d.accepted} accepted/transferred</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
