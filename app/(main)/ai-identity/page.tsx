"use client";

import React, { useState } from "react";
import {
    Bot, Key, AlertTriangle, CheckCircle2, XCircle, Clock,
    Activity, ShieldAlert, Users, Plus, ChevronRight, Sparkles,
    RotateCw, Eye, Zap,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const AI_IDENTITIES = [
    { id: "NHI-001", name: "openai-prod-key",          type: "API Key",          owner: "ML Platform",  service: "OpenAI GPT-4",     permissions: "read, generate",    lastUsed: "2 mins ago",   expires: "2025-03-01", risk: "high",     status: "active"   },
    { id: "NHI-002", name: "fraud-detect-sa",           type: "Service Account",  owner: "Data Science", service: "GCP Vertex AI",    permissions: "predict, explain",  lastUsed: "14 mins ago",  expires: "Never",      risk: "high",     status: "active"   },
    { id: "NHI-003", name: "github-copilot-oauth",      type: "OAuth Client",     owner: "Engineering",  service: "GitHub Copilot",   permissions: "repo:read, code",   lastUsed: "1 hour ago",   expires: "2025-01-15", risk: "medium",   status: "active"   },
    { id: "NHI-004", name: "churn-model-webhook",       type: "Webhook Secret",   owner: "ML Platform",  service: "Internal ML",      permissions: "webhook:invoke",    lastUsed: "6 hours ago",  expires: "2024-12-01", risk: "medium",   status: "expiring" },
    { id: "NHI-005", name: "hr-screener-azure-sp",      type: "Service Principal",owner: "HR Systems",   service: "Azure OpenAI",     permissions: "cognitive:all",     lastUsed: "2 days ago",   expires: "2025-06-01", risk: "high",     status: "flagged"  },
    { id: "NHI-006", name: "analytics-bedrock-key",     type: "API Key",          owner: "Analytics",    service: "AWS Bedrock",      permissions: "invoke, stream",    lastUsed: "3 days ago",   expires: "2025-02-15", risk: "low",      status: "active"   },
    { id: "NHI-007", name: "legacy-ml-service-token",   type: "Bearer Token",     owner: "Unknown",      service: "Internal ML",      permissions: "admin",             lastUsed: "47 days ago",  expires: "2024-11-20", risk: "critical", status: "expired"  },
];

const POLICY_CHECKS = [
    { check: "Rotation policy (≤90 days)",  passing: 4, total: 7 },
    { check: "Owner assigned",              passing: 6, total: 7 },
    { check: "Least-privilege permissions", passing: 3, total: 7 },
    { check: "Expiry date configured",      passing: 6, total: 7 },
    { check: "MFA-backed credential",       passing: 2, total: 7 },
];

const ACTIVITY_LOG = [
    { time: "2 mins ago",  identity: "openai-prod-key",        event: "Token used for completion request",  service: "OpenAI", alert: false },
    { time: "14 mins ago", identity: "fraud-detect-sa",        event: "Batch prediction job completed",     service: "GCP",    alert: false },
    { time: "47 mins ago", identity: "github-copilot-oauth",   event: "Code suggestion generated",          service: "GitHub", alert: false },
    { time: "2 hours ago", identity: "hr-screener-azure-sp",   event: "Unusual request volume spike",       service: "Azure",  alert: true  },
    { time: "6 hours ago", identity: "analytics-bedrock-key",  event: "New model version invoked",          service: "AWS",    alert: false },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const RISK_STYLE: Record<string, string> = {
    critical: "text-red-300 bg-red-500/20 border-red-500/30 shadow-sm shadow-red-500/20",
    high:     "text-red-400 bg-red-500/10 border-red-500/20",
    medium:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
    low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const STATUS_STYLE: Record<string, string> = {
    active:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    expiring: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    flagged:  "text-red-400 bg-red-500/10 border-red-500/20",
    expired:  "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const TYPE_STYLE: Record<string, string> = {
    "API Key":           "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "Service Account":   "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    "OAuth Client":      "text-purple-400 bg-purple-500/10 border-purple-500/20",
    "Webhook Secret":    "text-teal-400 bg-teal-500/10 border-teal-500/20",
    "Service Principal": "text-violet-400 bg-violet-500/10 border-violet-500/20",
    "Bearer Token":      "text-red-400 bg-red-500/10 border-red-500/20",
};

const SERVICE_COLOR: Record<string, string> = {
    OpenAI: "bg-emerald-500/15 text-emerald-400",
    GCP:    "bg-blue-500/15 text-blue-400",
    GitHub: "bg-slate-600/50 text-slate-300",
    Azure:  "bg-sky-500/15 text-sky-400",
    AWS:    "bg-orange-500/15 text-orange-400",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AIIdentityPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const criticalHigh = AI_IDENTITIES.filter(i => i.risk === "critical" || i.risk === "high").length;
    const expiring     = AI_IDENTITIES.filter(i => i.status === "expiring").length;
    const violations   = POLICY_CHECKS.reduce((sum, p) => sum + (p.total - p.passing), 0);

    return (
        <div className="w-full flex flex-col space-y-6 animate-in fade-in duration-700">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AI Identity</h1>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> PREVIEW
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Govern non-human identities — AI agents, service accounts, API keys, and OAuth credentials
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm font-medium rounded-xl transition-colors shrink-0"
                    onClick={() => {}}
                >
                    <Plus className="w-4 h-4" /> Register Identity
                </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Identities",    value: AI_IDENTITIES.length, sub: "Registered NHIs",         icon: Bot,         color: "text-blue-400",   iconColor: "text-blue-600"   },
                    { label: "Critical / High Risk", value: criticalHigh,         sub: "Require immediate action", icon: AlertTriangle,color: "text-red-400",   iconColor: "text-red-600"    },
                    { label: "Expiring Soon",        value: expiring,             sub: "Next 30 days",             icon: Clock,       color: "text-amber-400",  iconColor: "text-amber-600"  },
                    { label: "Policy Violations",    value: violations,           sub: "Across 5 checks",          icon: ShieldAlert, color: "text-orange-400", iconColor: "text-orange-600" },
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

                {/* Identity Registry Table */}
                <div className="col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Identity Registry</h2>
                        </div>
                        <span className="text-xs text-slate-500">{AI_IDENTITIES.length} identities</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-800/40">
                                    {["ID", "Name", "Type", "Owner", "Service", "Permissions", "Last Used", "Risk", "Status"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {AI_IDENTITIES.map((id, i) => (
                                    <tr
                                        key={id.id}
                                        onClick={() => setSelectedId(selectedId === id.id ? null : id.id)}
                                        className={cn(
                                            "border-b border-slate-800/30 cursor-pointer transition-colors",
                                            i % 2 === 0 ? "bg-slate-800/10" : "",
                                            selectedId === id.id ? "bg-blue-500/5 border-blue-500/20" : "hover:bg-slate-800/30"
                                        )}
                                    >
                                        <td className="px-4 py-3 font-mono text-slate-500">{id.id}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-300 whitespace-nowrap">{id.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap", TYPE_STYLE[id.type] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20")}>
                                                {id.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{id.owner}</td>
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{id.service}</td>
                                        <td className="px-4 py-3 font-mono text-slate-500 max-w-[140px] truncate">{id.permissions}</td>
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{id.lastUsed}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide", RISK_STYLE[id.risk])}>
                                                {id.risk}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", STATUS_STYLE[id.status])}>
                                                {id.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Expanded identity detail */}
                    {selectedId && (() => {
                        const id = AI_IDENTITIES.find(x => x.id === selectedId)!;
                        return (
                            <div className="px-5 py-4 border-t border-blue-500/20 bg-blue-500/5">
                                <div className="flex items-start gap-6">
                                    <div>
                                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Expires</p>
                                        <p className="text-sm font-mono text-slate-300">{id.expires}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Permissions</p>
                                        <p className="text-sm font-mono text-slate-300">{id.permissions}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                                            <RotateCw className="w-3 h-3" /> Rotate
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                                            <Eye className="w-3 h-3" /> Audit Log
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                                            <XCircle className="w-3 h-3" /> Revoke
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Right panel */}
                <div className="flex flex-col gap-4">

                    {/* Policy Compliance */}
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Policy Compliance</h2>
                        </div>
                        <div className="space-y-3">
                            {POLICY_CHECKS.map(p => {
                                const pct = Math.round((p.passing / p.total) * 100);
                                const ok = p.passing === p.total;
                                return (
                                    <div key={p.check}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] text-slate-400 leading-snug flex-1 pr-2">{p.check}</span>
                                            <span className={cn("text-[11px] font-bold shrink-0", ok ? "text-emerald-400" : "text-red-400")}>
                                                {p.passing}/{p.total}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-700", ok ? "bg-emerald-500" : "bg-red-500")}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Risk Distribution */}
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Risk Distribution</h2>
                        </div>
                        <div className="space-y-2">
                            {[
                                { tier: "Critical", count: AI_IDENTITIES.filter(i => i.risk === "critical").length, style: "bg-red-500",     textStyle: "text-red-400" },
                                { tier: "High",     count: AI_IDENTITIES.filter(i => i.risk === "high").length,     style: "bg-orange-500",  textStyle: "text-orange-400" },
                                { tier: "Medium",   count: AI_IDENTITIES.filter(i => i.risk === "medium").length,   style: "bg-amber-500",   textStyle: "text-amber-400" },
                                { tier: "Low",      count: AI_IDENTITIES.filter(i => i.risk === "low").length,      style: "bg-emerald-500", textStyle: "text-emerald-400" },
                            ].map(({ tier, count, style, textStyle }) => (
                                <div key={tier} className="flex items-center gap-3">
                                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", style)} />
                                    <span className="text-xs text-slate-400 flex-1">{tier}</span>
                                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", style)} style={{ width: `${(count / AI_IDENTITIES.length) * 100}%` }} />
                                    </div>
                                    <span className={cn("text-xs font-bold w-4 text-right", textStyle)}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Activity Feed ── */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800/60">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-200">Recent Activity</h2>
                    <span className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                    </span>
                </div>
                <div className="divide-y divide-slate-800/40">
                    {ACTIVITY_LOG.map((entry, i) => (
                        <div key={i} className={cn(
                            "flex items-center gap-4 px-5 py-3.5 transition-colors",
                            entry.alert ? "bg-red-500/5 hover:bg-red-500/8" : "hover:bg-slate-800/20"
                        )}>
                            <span className="text-xs text-slate-600 w-24 shrink-0">{entry.time}</span>
                            <span className={cn("text-[11px] font-mono px-2 py-0.5 rounded shrink-0", SERVICE_COLOR[entry.service] ?? "bg-slate-700 text-slate-300")}>
                                {entry.service}
                            </span>
                            <span className="text-xs font-mono text-slate-400 shrink-0">{entry.identity}</span>
                            <span className="text-xs text-slate-500 flex-1 truncate">{entry.event}</span>
                            {entry.alert && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full shrink-0">
                                    <Zap className="w-2.5 h-2.5" /> ALERT
                                </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
