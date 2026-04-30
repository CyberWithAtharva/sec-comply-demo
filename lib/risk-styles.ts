/**
 * Shared style tokens and severity helpers for the Risk Management module.
 * Kept framework-agnostic so the same primitives drive Overview, Library, Register.
 */

export type RiskStatus =
    | "open"
    | "in_progress"
    | "mitigated"
    | "accepted"
    | "transferred"
    | "closed";

export type Treatment = "mitigate" | "accept" | "transfer" | "avoid";

export type RiskLevel = "low" | "medium" | "high" | "critical";

// ─── Score → severity ───────────────────────────────────────────────────────
// Per spec §4.2: 1–5 Low · 6–12 Medium · 13–19 High · 20–25 Critical

export interface SeverityToken {
    label: string;
    level: RiskLevel;
    color: string;       // Tailwind text-*-400
    bg: string;          // Tailwind bg-*-500/10
    border: string;      // Tailwind border-*-500/20
    dot: string;         // Tailwind bg-*-500
    fill: string;        // Hex (for SVG / inline styles)
    glow: string;        // rgba (for box-shadow)
}

export function severityFromScore(score: number): SeverityToken {
    if (score >= 20) {
        return { label: "Critical", level: "critical",
            color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30",
            dot: "bg-red-500", fill: "#ef4444", glow: "rgba(239,68,68,0.5)" };
    }
    if (score >= 13) {
        return { label: "High", level: "high",
            color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30",
            dot: "bg-orange-500", fill: "#f97316", glow: "rgba(249,115,22,0.4)" };
    }
    if (score >= 6) {
        return { label: "Medium", level: "medium",
            color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
            dot: "bg-amber-500", fill: "#f59e0b", glow: "rgba(245,158,11,0.35)" };
    }
    return { label: "Low", level: "low",
        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
        dot: "bg-emerald-500", fill: "#22c55e", glow: "rgba(34,197,94,0.3)" };
}

// ─── Status → badge styling ────────────────────────────────────────────────

export const STATUS_LABELS: Record<RiskStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    mitigated: "Mitigated",
    accepted: "Accepted",
    transferred: "Transferred",
    closed: "Closed",
};

export const STATUS_STYLES: Record<RiskStatus, string> = {
    open:        "bg-slate-500/10 text-slate-300 border-slate-500/30",
    in_progress: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    mitigated:   "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    accepted:    "bg-purple-500/10 text-purple-300 border-purple-500/30",
    transferred: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    closed:      "bg-slate-700/40 text-slate-400 border-slate-600/40",
};

export const STATUS_OPTIONS: RiskStatus[] = [
    "open", "in_progress", "mitigated", "accepted", "transferred", "closed",
];

// "Active" risks count toward open exposure on the Overview heatmap.
export const ACTIVE_STATUSES: ReadonlySet<RiskStatus> = new Set(["open", "in_progress"]);

export function isActive(status: string): boolean {
    return ACTIVE_STATUSES.has(status as RiskStatus);
}

// ─── Treatment → styling + label ───────────────────────────────────────────

export const TREATMENT_LABELS: Record<Treatment, string> = {
    mitigate: "Mitigate",
    accept: "Accept",
    transfer: "Transfer",
    avoid: "Avoid",
};

export const TREATMENT_STYLES: Record<Treatment, string> = {
    mitigate: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    accept:   "bg-purple-500/10 text-purple-300 border-purple-500/30",
    transfer: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    avoid:    "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

export const TREATMENT_OPTIONS: Treatment[] = ["mitigate", "accept", "transfer", "avoid"];

// ─── Spec-required treatment guidance (panel copy) ─────────────────────────

export const TREATMENT_DESCRIPTIONS: Record<Treatment, string> = {
    mitigate: "Apply controls to reduce likelihood or impact to an acceptable level.",
    accept:   "Acknowledge and formally accept the risk within the organisation's risk appetite.",
    transfer: "Transfer the risk to a third party — typically through insurance or contract.",
    avoid:    "Eliminate the activity, asset, or data category that creates the risk entirely.",
};
