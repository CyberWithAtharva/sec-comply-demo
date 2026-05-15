"use client";

import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { severityFromScore, isActive } from "@/lib/risk-styles";
import type { RiskRow, StatusHistoryRow } from "../types";

interface Props {
    risks: RiskRow[];
    history: StatusHistoryRow[];
    /** Server timestamp passed in from the page (epoch ms) — keeps render pure. */
    nowMs: number;
}

export function RiskPostureSummary({ risks, history, nowMs }: Props) {
    const active = risks.filter(r => isActive(r.status));
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const r of active) {
        const sev = severityFromScore(r.risk_score);
        counts[sev.level] += 1;
    }
    const open = active.length;
    const mitigated = risks.filter(r => r.status === "mitigated").length;
    const accepted = risks.filter(r => r.status === "accepted").length;
    const transferred = risks.filter(r => r.status === "transferred").length;
    const closed = risks.filter(r => r.status === "closed").length;

    // Trend: opened vs resolved status transitions in the last 30 days.
    const cutoff = nowMs - 30 * 24 * 60 * 60 * 1000;
    let opened = 0, resolved = 0;
    for (const h of history) {
        if (h.field !== "status") continue;
        if (new Date(h.changed_at).getTime() < cutoff) continue;
        if (h.to_value === "open" && (!h.from_value || h.from_value === "null")) opened += 1;
        if (["mitigated", "accepted", "transferred", "closed"].includes(h.to_value ?? "")) resolved += 1;
    }
    const delta = resolved - opened;
    const trend: "improving" | "worsening" | "stable" =
        delta > 1 ? "improving" : delta < -1 ? "worsening" : "stable";

    const cards = [
        { label: "Critical", value: counts.critical, color: "text-red-400",     bg: "bg-red-500/10" },
        { label: "High",     value: counts.high,     color: "text-orange-400",  bg: "bg-orange-500/10" },
        { label: "Medium",   value: counts.medium,   color: "text-amber-400",   bg: "bg-amber-500/10" },
        { label: "Low",      value: counts.low,      color: "text-emerald-400", bg: "bg-emerald-500/10" },
    ];

    const TrendIcon = trend === "improving" ? TrendingDown : trend === "worsening" ? TrendingUp : Minus;
    const trendColor = trend === "improving" ? "text-emerald-400" : trend === "worsening" ? "text-rose-400" : "text-muted-foreground";

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map(c => (
                    <div key={c.label} className={`glass-panel p-5 rounded-2xl ${c.bg}`}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{c.label}</p>
                        <p className={`text-3xl font-bold tracking-tight ${c.color}`}>{c.value}</p>
                        <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mt-1">active</p>
                    </div>
                ))}
            </div>

            <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posture by Status</h3>
                    <div className={`flex items-center gap-1.5 text-xs ${trendColor}`}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{trend}</span>
                        <span className="text-muted-foreground/70">· last 30 days</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Stat label="Open / Active" value={open} hue="text-amber-400" />
                    <Stat label="Mitigated"     value={mitigated} hue="text-emerald-400" />
                    <Stat label="Accepted"      value={accepted} hue="text-purple-400" />
                    <Stat label="Transferred"   value={transferred} hue="text-cyan-400" />
                    <Stat label="Closed"        value={closed} hue="text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, hue }: { label: string; value: number; hue: string }) {
    return (
        <div className="bg-background/40 border border-border/40 rounded-xl px-3 py-2.5">
            <p className={`text-2xl font-black ${hue}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
    );
}
