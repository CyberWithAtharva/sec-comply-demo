"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, X, Eye, ArrowUpRight, CheckCircle2,
    Clock, AlertTriangle, ChevronDown,
} from "lucide-react";
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViolationType = "Policy Violation" | "Hallucination" | "Harmful Content" | "Bias Detected" | "Data Leakage";
type Severity = "Critical" | "High" | "Medium" | "Low";
type LogStatus = "Open" | "Under Review" | "Resolved" | "False Positive" | "Escalated";

interface OutputLog {
    id: string;
    system: string;
    timestamp: string;
    user: string;
    violationType: ViolationType;
    severity: Severity;
    status: LogStatus;
    prompt: string;
    output: string;
    reason: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LOGS: OutputLog[] = [
    {
        id: "LOG-0041", system: "GPT-4 via OpenAI API", timestamp: "2 hours ago", user: "rahul.shah",
        violationType: "Hallucination", severity: "High", status: "Open",
        prompt: "Summarize the Q3 financial results for Acme Corp and include analyst consensus estimates.",
        output: "Acme Corp reported Q3 revenue of $4.2B, up 18% YoY. Analyst consensus was $3.9B. EPS came in at $1.42 vs. $1.38 estimate...",
        reason: "Model cited analyst estimates that do not match any verified source. Confidence score < 0.4 on 3 factual claims.",
    },
    {
        id: "LOG-0039", system: "Customer Churn Predictor", timestamp: "5 hours ago", user: "priya.mehta",
        violationType: "Bias Detected", severity: "Critical", status: "Under Review",
        prompt: "Run churn prediction for customer segment: high-value, age 60+.",
        output: "Predicted churn probability: 78% for this segment. Recommended action: reduce service tier.",
        reason: "Model output shows 34% higher churn prediction for 60+ age group vs. comparable behavioral profiles in younger cohorts. Age-based bias threshold exceeded.",
    },
    {
        id: "LOG-0037", system: "HR Resume Screener", timestamp: "1 day ago", user: "sneha.patil",
        violationType: "Policy Violation", severity: "Critical", status: "Open",
        prompt: "Screen 45 resumes for Senior Engineer role. Filter by top universities.",
        output: "Shortlisted 8 candidates. IIT, NIT, and BITS graduates ranked higher. 3 candidates excluded based on graduation institution tier.",
        reason: "EU AI Act Art. 10 violation: educational institution filtering constitutes proxy discrimination. Model output not compliant with HR policy HR-POL-012.",
    },
    {
        id: "LOG-0035", system: "Fraud Detection Engine", timestamp: "1 day ago", user: "arjun.nair",
        violationType: "Data Leakage", severity: "High", status: "Escalated",
        prompt: "Explain why transaction TXN-884421 was flagged as fraudulent.",
        output: "Transaction was flagged because card ending 4821 belonging to REDACTED has been involved in 3 previous disputes. Account balance was $12,440 at time of transaction.",
        reason: "Model output included PAN partial data and account balance in non-sanitized explanation. Data minimization policy violated.",
    },
    {
        id: "LOG-0033", system: "GPT-4 via OpenAI API", timestamp: "2 days ago", user: "dev.team",
        violationType: "Harmful Content", severity: "High", status: "Resolved",
        prompt: "Write a persuasive email from our CEO to employees about recent layoffs.",
        output: "Dear Team, As your CEO I wanted to personally inform you that we are letting 200 of you go... The decision was purely financial and nothing personal...",
        reason: "Output mimicked executive identity without authorization. Content flagged by HR policy as potentially manipulative communication.",
    },
    {
        id: "LOG-0031", system: "Gemini API (Google)", timestamp: "2 days ago", user: "rahul.shah",
        violationType: "Hallucination", severity: "Medium", status: "False Positive",
        prompt: "What is the current market share of our product in the APAC region?",
        output: "Based on available data, your product holds approximately 12–15% market share in APAC as of Q2 2024.",
        reason: "Initial flag was hallucination — model stated a specific range. On review, output matched internal report MKTG-2024-Q2. Marked as false positive.",
    },
    {
        id: "LOG-0029", system: "Loan Approval Model", timestamp: "3 days ago", user: "arjun.nair",
        violationType: "Bias Detected", severity: "Critical", status: "Under Review",
        prompt: "Generate loan approval recommendations for batch B-4421 (287 applicants).",
        output: "Approved: 134. Denied: 153. Approval rate by zip code: 91001 (67%), 90011 (28%), 94103 (72%).",
        reason: "Approval rate disparity by zip code correlates with racial demographics (Pearson r=0.81). ECOA/Fair Lending bias detected above 40% threshold.",
    },
    {
        id: "LOG-0027", system: "GPT-4 via OpenAI API", timestamp: "4 days ago", user: "admin",
        violationType: "Policy Violation", severity: "Medium", status: "Resolved",
        prompt: "Draft a terms of service update that limits user data deletion rights.",
        output: "14. Data Retention. Notwithstanding user requests, Company may retain personal data for up to 7 years for business analytics purposes...",
        reason: "Draft output conflicts with DPDPA Section 8 requirements for data deletion on request. Legal compliance policy POL-017 violated.",
    },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────

const CHART_DATA = [
    { day: "Mar 1",  outputs: 182, flagged: 8  }, { day: "Mar 3",  outputs: 210, flagged: 14 },
    { day: "Mar 5",  outputs: 195, flagged: 9  }, { day: "Mar 7",  outputs: 248, flagged: 18 },
    { day: "Mar 9",  outputs: 221, flagged: 11 }, { day: "Mar 11", outputs: 267, flagged: 22 },
    { day: "Mar 13", outputs: 240, flagged: 15 }, { day: "Mar 15", outputs: 290, flagged: 28 },
    { day: "Mar 17", outputs: 275, flagged: 19 }, { day: "Mar 19", outputs: 312, flagged: 31 },
    { day: "Mar 21", outputs: 298, flagged: 24 }, { day: "Mar 23", outputs: 330, flagged: 35 },
    { day: "Mar 25", outputs: 318, flagged: 27 }, { day: "Mar 27", outputs: 345, flagged: 38 },
    { day: "Mar 29", outputs: 361, flagged: 42 }, { day: "Mar 31", outputs: 388, flagged: 47 },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<Severity, { cls: string }> = {
    Critical: { cls: "bg-red-500/15 text-red-300 border-red-500/30 shadow-sm shadow-red-500/20" },
    High:     { cls: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
    Medium:   { cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    Low:      { cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

const STATUS_CONFIG: Record<LogStatus, { cls: string; icon: React.ReactNode }> = {
    Open:          { cls: "bg-red-500/10 text-red-300 border-red-500/25",       icon: <AlertTriangle className="w-3 h-3" /> },
    "Under Review": { cls: "bg-amber-500/10 text-amber-300 border-amber-500/25", icon: <Clock className="w-3 h-3" /> },
    Resolved:      { cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25", icon: <CheckCircle2 className="w-3 h-3" /> },
    "False Positive": { cls: "bg-slate-500/15 text-slate-400 border-slate-500/30", icon: <X className="w-3 h-3" /> },
    Escalated:     { cls: "bg-purple-500/10 text-purple-300 border-purple-500/25", icon: <ArrowUpRight className="w-3 h-3" /> },
};

const VIOLATION_COLORS: Record<ViolationType, string> = {
    "Policy Violation": "bg-red-500/15 text-red-300 border-red-500/25",
    "Hallucination":    "bg-purple-500/15 text-purple-300 border-purple-500/25",
    "Harmful Content":  "bg-orange-500/15 text-orange-300 border-orange-500/25",
    "Bias Detected":    "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
    "Data Leakage":     "bg-teal-500/15 text-teal-300 border-teal-500/25",
};

// ─── View Output Modal ────────────────────────────────────────────────────────

function OutputModal({ log, onClose }: { log: OutputLog; onClose: () => void }) {
    const [notes, setNotes] = useState("");
    const sv = SEVERITY_CONFIG[log.severity];
    const st = STATUS_CONFIG[log.status];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-start justify-between p-5 border-b border-slate-800/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-100 font-mono">{log.id}</span>
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-lg border", VIOLATION_COLORS[log.violationType])}>{log.violationType}</span>
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-lg border", sv.cls)}>{log.severity}</span>
                        </div>
                        <p className="text-xs text-slate-500">{log.system} · {log.timestamp} · {log.user}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Input Prompt</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{log.prompt}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">AI Output</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{log.output}</p>
                        </div>
                        <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Violation Reason</p>
                            <p className="text-sm text-red-300/90 leading-relaxed">{log.reason}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-800/30 rounded-xl p-3">
                            <p className="text-slate-500 mb-1">Status</p>
                            <span className={cn("inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-lg border", st.cls)}>{st.icon}{log.status}</span>
                        </div>
                        <div className="bg-slate-800/30 rounded-xl p-3">
                            <p className="text-slate-500 mb-1">Assigned Reviewer</p>
                            <p className="text-slate-300 font-medium">compliance.team</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Resolution Notes</label>
                        <textarea
                            value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                            placeholder="Add resolution notes or escalation reason…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                        <button onClick={onClose} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 shadow-xl text-xs">
            <p className="text-slate-400 font-medium mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.name === "flagged" ? "#f97316" : "#6366f1" }} className="font-semibold">
                    {p.name === "flagged" ? "Flagged" : "Total"}: {p.value}
                </p>
            ))}
        </div>
    );
}

// ─── Monitoring Policy Section ────────────────────────────────────────────────

interface MonitoringPolicy { label: string; type: "toggle" | "slider" | "select"; value: boolean | string; options?: string[] }

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OutputMonitoringPage() {
    const [logs] = useState<OutputLog[]>(LOGS);
    const [selectedLog, setSelectedLog] = useState<OutputLog | null>(null);
    const [search, setSearch] = useState("");
    const [filterSeverity, setFilterSeverity] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterViolation, setFilterViolation] = useState("all");
    const [autoEscalate, setAutoEscalate] = useState(true);
    const [notifyCompliance, setNotifyCompliance] = useState(true);
    const [sensitivity, setSensitivity] = useState("Medium");
    const [retention, setRetention] = useState("90 days");

    const filtered = useMemo(() => logs.filter(l => {
        if (search && !l.id.toLowerCase().includes(search.toLowerCase()) && !l.system.toLowerCase().includes(search.toLowerCase()) && !l.user.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterSeverity !== "all" && l.severity !== filterSeverity) return false;
        if (filterStatus !== "all" && l.status !== filterStatus) return false;
        if (filterViolation !== "all" && l.violationType !== filterViolation) return false;
        return true;
    }), [logs, search, filterSeverity, filterStatus, filterViolation]);

    const stats = {
        total: 4821,
        violations: logs.filter(l => l.status !== "False Positive" && l.status !== "Resolved").length,
        hallucinations: logs.filter(l => l.violationType === "Hallucination").length,
        pending: logs.filter(l => l.status === "Open" || l.status === "Under Review").length,
    };

    const selectCls = "bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/40 transition-colors cursor-pointer";

    return (
        <div className="w-full flex flex-col space-y-5 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-5 h-5 text-orange-400" />
                        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AI Output Monitoring</h1>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">PREVIEW</span>
                    </div>
                    <p className="text-sm text-slate-400">Monitor AI system outputs for policy violations, hallucinations, and harmful content</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Outputs Logged (30d)", value: stats.total.toLocaleString(), icon: Activity,      color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "Policy Violations",    value: stats.violations,             icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
                    { label: "Hallucinations",       value: stats.hallucinations,          icon: Eye,           color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
                    { label: "Pending Review",       value: stats.pending,                icon: Clock,         color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-500 font-medium">{label}</span>
                            <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", bg)}>
                                <Icon className={cn("w-4 h-4", color)} />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-slate-100">{value}</span>
                    </div>
                ))}
            </div>

            {/* Line Chart */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-200">AI Output Volume & Violations</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Last 30 days</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-indigo-400 rounded" /><span className="text-slate-400">Total Outputs</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-orange-400 rounded" /><span className="text-slate-400">Flagged</span></div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} interval={2} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="outputs" stroke="#6366f1" strokeWidth={2} dot={false} name="outputs" />
                        <Line type="monotone" dataKey="flagged"  stroke="#f97316" strokeWidth={2} dot={false} name="flagged" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Filters */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Activity className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search log ID, system or user…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                        />
                    </div>
                    <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className={selectCls}>
                        <option value="all">All Severities</option>
                        <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <select value={filterViolation} onChange={e => setFilterViolation(e.target.value)} className={selectCls}>
                        <option value="all">All Violation Types</option>
                        <option>Policy Violation</option><option>Hallucination</option>
                        <option>Harmful Content</option><option>Bias Detected</option><option>Data Leakage</option>
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
                        <option value="all">All Statuses</option>
                        <option>Open</option><option>Under Review</option><option>Resolved</option>
                        <option>False Positive</option><option>Escalated</option>
                    </select>
                    {(search || filterSeverity !== "all" || filterStatus !== "all" || filterViolation !== "all") && (
                        <button onClick={() => { setSearch(""); setFilterSeverity("all"); setFilterStatus("all"); setFilterViolation("all"); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 rounded-xl border border-slate-700/40 transition-colors">
                            <X className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Flagged Output Log Table */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800/60">
                    <h2 className="text-sm font-semibold text-slate-200">Flagged Output Log</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800/40">
                                {["Log ID", "AI System", "Timestamp", "User", "Violation Type", "Severity", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(l => {
                                const sv = SEVERITY_CONFIG[l.severity];
                                const st = STATUS_CONFIG[l.status];
                                return (
                                    <tr key={l.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs font-semibold text-slate-300">{l.id}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap max-w-[160px] truncate">{l.system}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{l.timestamp}</td>
                                        <td className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">{l.user}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-medium px-2 py-1 rounded-lg border", VIOLATION_COLORS[l.violationType])}>{l.violationType}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg border", sv.cls)}>{l.severity}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border whitespace-nowrap", st.cls)}>
                                                {st.icon}{l.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setSelectedLog(l)}
                                                    className="px-2 py-1 text-[10px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/25 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> View
                                                </button>
                                                <button className="px-2 py-1 text-[10px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1">
                                                    <ArrowUpRight className="w-3 h-3" /> Escalate
                                                </button>
                                                <button className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Resolve
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">No logs match your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-800/40">
                    <span className="text-xs text-slate-500">{filtered.length} of {logs.length} flagged logs</span>
                </div>
            </div>

            {/* Monitoring Policies */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-200 mb-1">Monitoring Policies</h2>
                <p className="text-xs text-slate-500 mb-5">Configure detection thresholds and notification rules</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Sensitivity slider */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-slate-200">Hallucination Detection Sensitivity</p>
                                <p className="text-xs text-slate-500 mt-0.5">Higher sensitivity may increase false positives</p>
                            </div>
                            <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border",
                                sensitivity === "High" ? "bg-red-500/15 text-red-300 border-red-500/25" :
                                sensitivity === "Medium" ? "bg-amber-500/15 text-amber-300 border-amber-500/25" :
                                "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                            )}>{sensitivity}</span>
                        </div>
                        <div className="flex gap-2">
                            {["Low", "Medium", "High"].map(s => (
                                <button key={s} onClick={() => setSensitivity(s)}
                                    className={cn("flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                                        sensitivity === s
                                            ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                                            : "bg-slate-700/30 text-slate-500 border-slate-700/40 hover:border-slate-600"
                                    )}>{s}</button>
                            ))}
                        </div>
                    </div>

                    {/* Log retention */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                        <p className="text-sm font-medium text-slate-200 mb-1">Retain Output Logs For</p>
                        <p className="text-xs text-slate-500 mb-3">Logs older than this period are purged automatically</p>
                        <div className="relative">
                            <select value={retention} onChange={e => setRetention(e.target.value)}
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/40 transition-colors cursor-pointer appearance-none">
                                <option>30 days</option><option>90 days</option><option>1 year</option><option>7 years</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Toggles */}
                    {[
                        { label: "Auto-escalate Critical violations",   desc: "Automatically escalates to CISO when severity is Critical.", val: autoEscalate, set: setAutoEscalate },
                        { label: "Notify compliance on Policy Violations", desc: "Sends email to compliance team for every new policy violation.", val: notifyCompliance, set: setNotifyCompliance },
                    ].map(({ label, desc, val, set }) => (
                        <div key={label} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-200">{label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                            </div>
                            <button onClick={() => set(v => !v)}
                                className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none",
                                    val ? "bg-orange-500 border-orange-500" : "bg-slate-700 border-slate-600")}>
                                <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200", val ? "translate-x-5" : "translate-x-0.5")} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* View Output Modal */}
            <AnimatePresence>
                {selectedLog && <OutputModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
            </AnimatePresence>
        </div>
    );
}
