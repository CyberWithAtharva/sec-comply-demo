"use client";

import React, { useState } from "react";
import {
    BrainCircuit, AlertTriangle, CheckCircle2, XCircle, Clock,
    TrendingUp, Eye, ShieldCheck, Users, Plus, ChevronRight,
    Sparkles, FileWarning, ClipboardList,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const AI_MODELS = [
    { id: "M-001", name: "Customer Churn Predictor",  type: "ML Classification", vendor: "Internal",  riskTier: "Limited",  status: "Active",        lastAssessed: "12 days ago", frameworks: ["EU AI Act", "NIST AI RMF"],              oversight: true  },
    { id: "M-002", name: "LLM Email Summarizer",      type: "Generative AI",     vendor: "OpenAI",    riskTier: "High",     status: "Under Review",  lastAssessed: "3 days ago",  frameworks: ["EU AI Act", "ISO 42001"],                oversight: false },
    { id: "M-003", name: "Fraud Detection Engine",    type: "ML Anomaly",        vendor: "Internal",  riskTier: "High",     status: "Active",        lastAssessed: "7 days ago",  frameworks: ["EU AI Act", "NIST AI RMF", "ISO 42001"], oversight: true  },
    { id: "M-004", name: "HR Resume Screener",        type: "ML Classification", vendor: "Workday",   riskTier: "High",     status: "Flagged",       lastAssessed: "30 days ago", frameworks: ["EU AI Act"],                             oversight: false },
    { id: "M-005", name: "Code Review Assistant",     type: "Generative AI",     vendor: "GitHub",    riskTier: "Limited",  status: "Active",        lastAssessed: "5 days ago",  frameworks: ["NIST AI RMF"],                           oversight: true  },
    { id: "M-006", name: "Demand Forecasting",        type: "ML Regression",     vendor: "Internal",  riskTier: "Minimal",  status: "Active",        lastAssessed: "20 days ago", frameworks: ["NIST AI RMF"],                           oversight: true  },
];

const REGULATIONS = [
    { name: "EU AI Act 2024",  score: 68, controls: 42, verified: 29, color: "blue"   },
    { name: "NIST AI RMF",     score: 74, controls: 38, verified: 28, color: "indigo" },
    { name: "ISO 42001:2023",  score: 52, controls: 55, verified: 29, color: "purple" },
];

const RISK_ACTIONS = [
    { model: "HR Resume Screener",    action: "Complete bias & fairness assessment",    due: "Nov 30, 2024", severity: "high"   },
    { model: "LLM Email Summarizer",  action: "Human oversight log required",           due: "Dec 5, 2024",  severity: "high"   },
    { model: "Fraud Detection Engine",action: "Annual model accuracy audit due",        due: "Dec 15, 2024", severity: "medium" },
    { model: "HR Resume Screener",    action: "Document data lineage for training set", due: "Dec 20, 2024", severity: "medium" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const RISK_TIER_STYLE: Record<string, string> = {
    High:    "text-red-400 bg-red-500/15 border-red-500/25",
    Limited: "text-amber-400 bg-amber-500/15 border-amber-500/25",
    Minimal: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25",
};

const STATUS_STYLE: Record<string, string> = {
    "Active":        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "Under Review":  "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "Flagged":       "text-red-400 bg-red-500/10 border-red-500/20",
};

const TYPE_STYLE: Record<string, string> = {
    "Generative AI":     "text-purple-400 bg-purple-500/10 border-purple-500/20",
    "ML Classification": "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "ML Anomaly":        "text-orange-400 bg-orange-500/10 border-orange-500/20",
    "ML Regression":     "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

const REG_BAR_COLOR: Record<string, string> = {
    blue:   "bg-blue-500",
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
};

const REG_TEXT_COLOR: Record<string, string> = {
    blue:   "text-blue-400",
    indigo: "text-indigo-400",
    purple: "text-purple-400",
};

const SEV_STYLE: Record<string, string> = {
    high:   "text-red-400 bg-red-500/10 border-red-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AIGovernancePage() {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const highRisk    = AI_MODELS.filter(m => m.riskTier === "High").length;
    const oversightGaps = AI_MODELS.filter(m => !m.oversight).length;

    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0 mt-0.5">
                        <BrainCircuit className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AI Governance</h1>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> PREVIEW
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Track AI models, map to regulations, and maintain human oversight across your AI systems
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-sm font-medium rounded-xl transition-colors shrink-0"
                    onClick={() => {}}
                >
                    <Plus className="w-4 h-4" /> Register Model
                </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "AI Models",          value: AI_MODELS.length, sub: "Registered",          icon: BrainCircuit,  color: "text-purple-400", iconColor: "text-purple-500" },
                    { label: "High-Risk Models",   value: highRisk,         sub: "Require oversight",   icon: AlertTriangle, color: "text-red-400",    iconColor: "text-red-600"    },
                    { label: "Frameworks Covered", value: REGULATIONS.length, sub: "EU AI Act, NIST, ISO", icon: ShieldCheck,   color: "text-indigo-400", iconColor: "text-indigo-600" },
                    { label: "Oversight Gaps",     value: oversightGaps,    sub: "Need human review",   icon: Eye,           color: "text-amber-400",  iconColor: "text-amber-600"  },
                ].map(stat => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-1">
                                <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                                <Icon className={cn("w-4 h-4 mt-1.5", stat.iconColor)} />
                            </div>
                            <p className="text-xs font-semibold text-slate-300">{stat.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* ── Main Content Row ── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Model Registry Table */}
                <div className="col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Model Registry</h2>
                        </div>
                        <span className="text-xs text-slate-500">{AI_MODELS.length} models</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-800/40">
                                    {["ID", "Model", "Type", "Vendor", "Risk Tier", "Status", "Oversight", "Last Assessed"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {AI_MODELS.map((m, i) => (
                                    <tr
                                        key={m.id}
                                        onClick={() => setSelectedModel(selectedModel === m.id ? null : m.id)}
                                        className={cn(
                                            "border-b border-slate-800/30 cursor-pointer transition-colors",
                                            i % 2 === 0 ? "bg-slate-800/10" : "",
                                            selectedModel === m.id ? "bg-purple-500/5 border-purple-500/20" : "hover:bg-slate-800/30"
                                        )}
                                    >
                                        <td className="px-4 py-3 font-mono text-slate-500">{m.id}</td>
                                        <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{m.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap", TYPE_STYLE[m.type] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20")}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">{m.vendor}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", RISK_TIER_STYLE[m.riskTier])}>
                                                {m.riskTier}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap", STATUS_STYLE[m.status])}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {m.oversight
                                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                : <XCircle className="w-4 h-4 text-red-400" />}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{m.lastAssessed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Expanded model detail */}
                    {selectedModel && (() => {
                        const m = AI_MODELS.find(x => x.id === selectedModel)!;
                        return (
                            <div className="px-5 py-4 border-t border-purple-500/20 bg-purple-500/5">
                                <p className="text-xs font-semibold text-slate-300 mb-2">{m.name} — Framework Coverage</p>
                                <div className="flex flex-wrap gap-2">
                                    {m.frameworks.map(fw => (
                                        <span key={fw} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-300">
                                            {fw}
                                        </span>
                                    ))}
                                    {!m.oversight && (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                            <AlertTriangle className="w-3 h-3" /> Human oversight missing
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Regulation Coverage Panel */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex-1">
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Regulation Coverage</h2>
                        </div>
                        <div className="space-y-5">
                            {REGULATIONS.map(reg => (
                                <div key={reg.name}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-slate-300">{reg.name}</span>
                                        <span className={cn("text-xs font-bold", REG_TEXT_COLOR[reg.color])}>{reg.score}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-700", REG_BAR_COLOR[reg.color])}
                                            style={{ width: `${reg.score}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-1">{reg.verified}/{reg.controls} controls verified</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Tier summary */}
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4">Risk Distribution</h2>
                        <div className="space-y-2">
                            {[
                                { tier: "High",    count: AI_MODELS.filter(m => m.riskTier === "High").length,    style: "bg-red-500" },
                                { tier: "Limited", count: AI_MODELS.filter(m => m.riskTier === "Limited").length,  style: "bg-amber-500" },
                                { tier: "Minimal", count: AI_MODELS.filter(m => m.riskTier === "Minimal").length,  style: "bg-emerald-500" },
                            ].map(({ tier, count, style }) => (
                                <div key={tier} className="flex items-center gap-3">
                                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", style)} />
                                    <span className="text-xs text-slate-400 flex-1">{tier}</span>
                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", style)} style={{ width: `${(count / AI_MODELS.length) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 w-4 text-right">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Pending Actions ── */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800/60">
                    <FileWarning className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-semibold text-slate-200">Pending Actions</h2>
                    <span className="ml-auto text-xs text-slate-500">{RISK_ACTIONS.length} open</span>
                </div>
                <div className="divide-y divide-slate-800/40">
                    {RISK_ACTIONS.map((action, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/20 transition-colors">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", SEV_STYLE[action.severity])}>
                                {action.severity}
                            </span>
                            <span className="text-sm font-medium text-slate-300 shrink-0">{action.model}</span>
                            <span className="text-xs text-slate-500 flex-1 truncate">{action.action}</span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                                <Clock className="w-3 h-3" /> {action.due}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
