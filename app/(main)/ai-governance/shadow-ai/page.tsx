"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ScanSearch, AlertTriangle, Search, X, Eye,
    TriangleAlert, Users, Building2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShadowTool {
    id: string;
    name: string;
    category: "Code Generation" | "Content Generation" | "Data Analysis" | "Communication" | "Image Generation";
    department: string;
    estimatedUsers: number;
    riskLevel: "High" | "Medium" | "Low";
    dataExposure: string[];
    firstDetected: string;
    dismissed?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TOOLS: ShadowTool[] = [
    { id: "SH-001", name: "ChatGPT Personal Accounts",    category: "Content Generation", department: "Marketing",   estimatedUsers: 23, riskLevel: "High",   dataExposure: ["PII"],                          firstDetected: "Nov 2, 2024" },
    { id: "SH-002", name: "GitHub Copilot (unlicensed)",  category: "Code Generation",    department: "Engineering", estimatedUsers: 11, riskLevel: "High",   dataExposure: ["Source Code"],                  firstDetected: "Oct 28, 2024" },
    { id: "SH-003", name: "Midjourney",                   category: "Image Generation",   department: "Marketing",   estimatedUsers: 7,  riskLevel: "Low",    dataExposure: ["Low Sensitivity"],              firstDetected: "Nov 5, 2024" },
    { id: "SH-004", name: "Grammarly AI",                 category: "Content Generation", department: "All Depts",   estimatedUsers: 34, riskLevel: "Low",    dataExposure: ["PII"],                          firstDetected: "Sep 15, 2024" },
    { id: "SH-005", name: "Claude.ai (personal)",         category: "Content Generation", department: "HR",          estimatedUsers: 6,  riskLevel: "High",   dataExposure: ["PII", "Financial Data"],         firstDetected: "Nov 8, 2024" },
    { id: "SH-006", name: "Notion AI (unlicensed)",       category: "Content Generation", department: "Operations",  estimatedUsers: 9,  riskLevel: "Medium", dataExposure: ["Financial Data"],               firstDetected: "Oct 20, 2024" },
    { id: "SH-007", name: "Otter.ai",                     category: "Communication",      department: "Sales",       estimatedUsers: 14, riskLevel: "Medium", dataExposure: ["PII"],                          firstDetected: "Oct 14, 2024" },
    { id: "SH-008", name: "Perplexity AI",                category: "Data Analysis",      department: "Finance",     estimatedUsers: 5,  riskLevel: "High",   dataExposure: ["Financial Data"],               firstDetected: "Nov 1, 2024" },
    { id: "SH-009", name: "Jasper AI",                    category: "Content Generation", department: "Marketing",   estimatedUsers: 8,  riskLevel: "Medium", dataExposure: ["Low Sensitivity"],              firstDetected: "Oct 30, 2024" },
    { id: "SH-010", name: "Tabnine",                      category: "Code Generation",    department: "Engineering", estimatedUsers: 12, riskLevel: "Medium", dataExposure: ["Source Code"],                  firstDetected: "Nov 3, 2024" },
];

const DEPT_BREAKDOWN = [
    { dept: "Engineering", count: 2, users: 23 },
    { dept: "Marketing",   count: 4, users: 38 },
    { dept: "HR",          count: 1, users: 6 },
    { dept: "Finance",     count: 1, users: 5 },
    { dept: "Operations",  count: 1, users: 9 },
    { dept: "Sales",       count: 1, users: 14 },
];

const RISK_CONFIG = {
    High:   { cls: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
    Medium: { cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    Low:    { cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

const CATEGORY_COLORS: Record<ShadowTool["category"], string> = {
    "Code Generation":    "bg-blue-500/15 text-blue-300 border-blue-500/25",
    "Content Generation": "bg-purple-500/15 text-purple-300 border-purple-500/25",
    "Data Analysis":      "bg-teal-500/15 text-teal-300 border-teal-500/25",
    "Communication":      "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    "Image Generation":   "bg-pink-500/15 text-pink-300 border-pink-500/25",
};

const EXPOSURE_COLORS: Record<string, string> = {
    "PII":             "bg-red-500/15 text-red-300 border-red-500/25",
    "Financial Data":  "bg-orange-500/15 text-orange-300 border-orange-500/25",
    "Source Code":     "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
    "Low Sensitivity": "bg-slate-700/40 text-slate-400 border-slate-600/40",
};

interface PolicyToggle { label: string; description: string; enabled: boolean; }
const INITIAL_POLICIES: PolicyToggle[] = [
    { label: "Block unregistered AI tools from corporate network", description: "Requires network-level enforcement via proxy/firewall.", enabled: false },
    { label: "Auto-notify IT when new AI tool is detected",        description: "Sends an alert to IT security when a new tool is found.",  enabled: true  },
    { label: "Require manager approval before AI tool use",        description: "Triggers approval workflow before personal AI tool use.",   enabled: false },
    { label: "Weekly shadow AI digest to CISO",                    description: "Automated weekly summary report sent to CISO.",             enabled: true  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShadowAIPage() {
    const [tools, setTools] = useState<ShadowTool[]>(INITIAL_TOOLS);
    const [policies, setPolicies] = useState<PolicyToggle[]>(INITIAL_POLICIES);
    const [search, setSearch] = useState("");
    const [filterRisk, setFilterRisk] = useState("all");
    const [filterDept, setFilterDept] = useState("all");

    const active = tools.filter(t => !t.dismissed);

    const filtered = useMemo(() => active.filter(t => {
        if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.department.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterRisk !== "all" && t.riskLevel !== filterRisk) return false;
        if (filterDept !== "all" && t.department !== filterDept) return false;
        return true;
    }), [active, search, filterRisk, filterDept]);

    const departments = [...new Set(INITIAL_TOOLS.map(t => t.department))].sort();
    const maxDeptUsers = Math.max(...DEPT_BREAKDOWN.map(d => d.users));

    const dismiss = (id: string) => setTools(prev => prev.map(t => t.id === id ? { ...t, dismissed: true } : t));

    const selectCls = "bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/40 transition-colors cursor-pointer";

    return (
        <div className="w-full flex flex-col space-y-5 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ScanSearch className="w-5 h-5 text-orange-400" />
                        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Shadow AI Detection</h1>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">PREVIEW</span>
                    </div>
                    <p className="text-sm text-slate-400">Discover unauthorized AI tools in use across your organization</p>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-500/25 rounded-xl">
                <TriangleAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-red-300">
                        {active.length} unregistered AI tools detected across your organization.
                    </p>
                    <p className="text-xs text-red-400/80 mt-0.5">
                        {active.filter(t => t.riskLevel === "High").length} flagged as high risk — immediate review recommended.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Shadow Tools Detected",      value: active.length,                                         icon: ScanSearch, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                    { label: "High Risk Unregistered",     value: active.filter(t => t.riskLevel === "High").length,      icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                    { label: "Departments Affected",        value: new Set(active.map(t => t.department)).size,            icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "Tools Pending Review",       value: active.filter(t => t.riskLevel !== "Low").length,       icon: Eye, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
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

            {/* Department Breakdown */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" /> Department Shadow AI Exposure
                </h2>
                <div className="space-y-3">
                    {DEPT_BREAKDOWN.sort((a, b) => b.users - a.users).map(({ dept, count, users }) => (
                        <div key={dept} className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 w-28 shrink-0">{dept}</span>
                            <div className="flex-1 h-5 bg-slate-800/60 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(users / maxDeptUsers) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-semibold text-slate-300 w-8 text-right">{users}</span>
                                <span className="text-[10px] text-slate-500">users</span>
                                <span className="text-[10px] text-slate-600">·</span>
                                <span className="text-[10px] text-slate-500">{count} tool{count !== 1 ? "s" : ""}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search tools or departments…"
                            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                        />
                    </div>
                    <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className={selectCls}>
                        <option value="all">All Risk Levels</option>
                        <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className={selectCls}>
                        <option value="all">All Departments</option>
                        {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                    {(search || filterRisk !== "all" || filterDept !== "all") && (
                        <button onClick={() => { setSearch(""); setFilterRisk("all"); setFilterDept("all"); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 rounded-xl border border-slate-700/40 transition-colors">
                            <X className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800/60">
                    <h2 className="text-sm font-semibold text-slate-200">Detected Unregistered AI Tools</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800/40">
                                {["Tool Name", "Category", "Detected In", "Users", "Risk Level", "Data Exposure", "First Detected", "Actions"].map(h => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                                {filtered.map(t => (
                                    <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-200 whitespace-nowrap">{t.name}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">{t.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-[10px] font-medium px-2 py-1 rounded-lg border", CATEGORY_COLORS[t.category])}>{t.category}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                                                <Building2 className="w-3 h-3 text-slate-500" />{t.department}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-slate-300 text-xs">
                                                <Users className="w-3 h-3 text-slate-500" />{t.estimatedUsers}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg border", RISK_CONFIG[t.riskLevel].cls)}>{t.riskLevel}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {t.dataExposure.map(e => (
                                                    <span key={e} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", EXPOSURE_COLORS[e] ?? "bg-slate-700/40 text-slate-400 border-slate-600/40")}>{e}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{t.firstDetected}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button className="px-2 py-1 text-[10px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/25 rounded-lg transition-colors whitespace-nowrap">Register</button>
                                                <button className="px-2 py-1 text-[10px] font-semibold bg-slate-700/40 hover:bg-slate-700/60 text-slate-400 border border-slate-600/40 rounded-lg transition-colors">Investigate</button>
                                                <button onClick={() => dismiss(t.id)} className="px-2 py-1 text-[10px] font-semibold bg-slate-700/30 hover:bg-slate-700/50 text-slate-500 border border-slate-700/40 rounded-lg transition-colors">Dismiss</button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">No tools match your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-800/40">
                    <span className="text-xs text-slate-500">{filtered.length} of {active.length} tools</span>
                </div>
            </div>

            {/* Policy Enforcement */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-200 mb-1">Policy Enforcement</h2>
                <p className="text-xs text-slate-500 mb-4">Configure automated controls for shadow AI governance</p>
                <div className="space-y-3">
                    {policies.map((p, i) => (
                        <div key={i} className="flex items-start justify-between gap-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200">{p.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                            </div>
                            <button
                                onClick={() => setPolicies(prev => prev.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}
                                className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none",
                                    p.enabled ? "bg-orange-500 border-orange-500" : "bg-slate-700 border-slate-600"
                                )}
                            >
                                <span className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200",
                                    p.enabled ? "translate-x-5" : "translate-x-0.5"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
