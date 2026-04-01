"use client";

import React, { useState, useMemo } from "react";
import {
    Package, AlertCircle, CheckCircle2, Search,
    RefreshCw, Shield, ExternalLink, ChevronDown,
    AlertTriangle, Box, Lock,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import type { GitHubInstallation, GitHubFinding } from "@/components/github/GitHubClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupplyChainClientProps {
    initialInstallations: GitHubInstallation[];
    initialFindings: GitHubFinding[];
    orgId: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SEV_CFG: Record<string, { color: string; bg: string; border: string }> = {
    critical: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30" },
    high:     { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
    medium:   { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    low:      { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

const SEV_BAR_COLOR: Record<string, string> = {
    critical: "#ef4444",
    high:     "#f97316",
    medium:   "#f59e0b",
    low:      "#10b981",
};

function SeverityBadge({ severity }: { severity: string }) {
    const cfg = SEV_CFG[severity.toLowerCase()] ?? SEV_CFG.medium;
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            {severity}
        </span>
    );
}

function formatDate(d: string | null) {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Extract package name from finding details
function getPackageName(finding: GitHubFinding): string {
    const d = finding.details as Record<string, unknown>;
    return (d?.package as string) ?? (d?.package_name as string) ?? finding.title.split(" ")[0] ?? "unknown";
}

function getEcosystem(finding: GitHubFinding): string {
    const d = finding.details as Record<string, unknown>;
    return (d?.ecosystem as string) ?? (d?.manifest as string) ?? "—";
}

function getCVE(finding: GitHubFinding): string | null {
    const d = finding.details as Record<string, unknown>;
    return (d?.cve_id as string) ?? (d?.ghsa_id as string) ?? null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SupplyChainClient({ initialInstallations, initialFindings }: SupplyChainClientProps) {
    const [findings] = useState<GitHubFinding[]>(initialFindings);
    const [search, setSearch] = useState("");
    const [filterSev, setFilterSev] = useState("all");
    const [filterRepo, setFilterRepo] = useState("all");
    const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());

    const stats = useMemo(() => ({
        total:    findings.length,
        critical: findings.filter(f => f.severity === "critical").length,
        high:     findings.filter(f => f.severity === "high").length,
        medium:   findings.filter(f => f.severity === "medium").length,
        low:      findings.filter(f => f.severity === "low").length,
        repos:    new Set(findings.map(f => f.repository)).size,
    }), [findings]);

    const repos = useMemo(() => Array.from(new Set(findings.map(f => f.repository))).sort(), [findings]);

    const filtered = useMemo(() => findings.filter(f => {
        if (filterSev !== "all" && f.severity !== filterSev) return false;
        if (filterRepo !== "all" && f.repository !== filterRepo) return false;
        const q = search.toLowerCase();
        if (q && !f.title.toLowerCase().includes(q) && !f.repository.toLowerCase().includes(q)
            && !getPackageName(f).toLowerCase().includes(q)) return false;
        return true;
    }), [findings, filterSev, filterRepo, search]);

    // Per-repo breakdown for bar chart
    const repoBreakdown = useMemo(() => {
        const m = new Map<string, { critical: number; high: number; medium: number; low: number; total: number }>();
        for (const f of findings) {
            if (!m.has(f.repository)) m.set(f.repository, { critical: 0, high: 0, medium: 0, low: 0, total: 0 });
            const e = m.get(f.repository)!;
            e[f.severity as keyof typeof e]++;
            e.total++;
        }
        return [...m.entries()]
            .sort((a, b) => (b[1].critical * 4 + b[1].high * 2 + b[1].total) - (a[1].critical * 4 + a[1].high * 2 + a[1].total))
            .slice(0, 8)
            .map(([name, v]) => ({ name: name.split("/").pop() ?? name, fullName: name, ...v }));
    }, [findings]);

    // Top packages (most vulnerable)
    const topPackages = useMemo(() => {
        const m = new Map<string, { critical: number; high: number; total: number; repos: Set<string> }>();
        for (const f of findings) {
            const pkg = getPackageName(f);
            if (!m.has(pkg)) m.set(pkg, { critical: 0, high: 0, total: 0, repos: new Set() });
            const e = m.get(pkg)!;
            if (f.severity === "critical") e.critical++;
            if (f.severity === "high") e.high++;
            e.total++;
            e.repos.add(f.repository);
        }
        return [...m.entries()]
            .sort((a, b) => (b[1].critical * 4 + b[1].high * 2 + b[1].total) - (a[1].critical * 4 + a[1].high * 2 + a[1].total))
            .slice(0, 5)
            .map(([pkg, v]) => ({ pkg, ...v, repoCount: v.repos.size }));
    }, [findings]);

    const toggleRepo = (repo: string) => {
        setExpandedRepos(prev => {
            const next = new Set(prev);
            next.has(repo) ? next.delete(repo) : next.add(repo);
            return next;
        });
    };

    const noData = findings.length === 0;

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <Package className="w-8 h-8 mr-3 text-amber-400" />
                        Supply Chain Security
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Dependabot alerts, vulnerable dependencies, and third-party package risks across all repositories.</p>
                </div>
                <a
                    href="/github"
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
                >
                    <ExternalLink className="w-4 h-4" /> SCM Security
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { label: "Total Vulnerabilities", value: stats.total,    color: "text-slate-100" },
                    { label: "Critical",              value: stats.critical, color: stats.critical > 0 ? "text-red-400"     : "text-slate-400" },
                    { label: "High",                  value: stats.high,     color: stats.high > 0     ? "text-orange-400"  : "text-slate-400" },
                    { label: "Medium",                value: stats.medium,   color: stats.medium > 0   ? "text-amber-400"   : "text-slate-400" },
                    { label: "Low",                   value: stats.low,      color: "text-emerald-400" },
                    { label: "Repos Affected",        value: stats.repos,    color: "text-indigo-400" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4">
                        <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                        <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Connected orgs summary */}
            {initialInstallations.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {initialInstallations.map(inst => {
                        const instFindings = findings.filter(f => f.installation_id === inst.id);
                        const critical = instFindings.filter(f => f.severity === "critical").length;
                        const score = Math.max(0, 100 - Math.min(100, critical * 15 + instFindings.length));
                        const circ = 2 * Math.PI * 36;
                        const strokeColor = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
                        return (
                            <div key={inst.id} className="glass-panel rounded-2xl border border-slate-800/50 p-5 flex flex-col items-center min-w-[140px] flex-1">
                                <div className="relative">
                                    <svg width="88" height="88" className="-rotate-90">
                                        <circle cx="44" cy="44" r="36" fill="none" stroke="#1e293b" strokeWidth="7" />
                                        <circle cx="44" cy="44" r="36" fill="none" stroke={strokeColor} strokeWidth="7"
                                            strokeDasharray={`${(score / 100) * circ} ${circ}`}
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-slate-100">{score}</span>
                                        <span className="text-[9px] text-slate-500 uppercase">score</span>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-slate-200 mt-2 text-center truncate w-full">{inst.github_org}</p>
                                <p className="text-xs text-slate-500">{instFindings.length} vuln{instFindings.length !== 1 ? "s" : ""}</p>
                                {inst.last_sync && <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(inst.last_sync)}</p>}
                            </div>
                        );
                    })}
                </div>
            )}

            {noData ? (
                <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center py-24 text-center">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
                        <Package className="w-10 h-10 text-amber-400" />
                    </div>
                    <p className="text-slate-300 font-semibold text-lg mb-1">No Dependabot Alerts</p>
                    <p className="text-slate-500 text-sm max-w-sm">Connect a GitHub organisation from the SCM Security page and run a sync to import Dependabot vulnerability data.</p>
                    <a href="/github" className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-xl transition-colors">
                        <ExternalLink className="w-4 h-4" /> Go to SCM Security
                    </a>
                </div>
            ) : (
                <>
                    {/* Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bar chart: vulns by repo */}
                        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800/50 p-5">
                            <p className="text-sm font-semibold text-slate-200 mb-4">Vulnerabilities by Repository</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={repoBreakdown} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                                        labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                                        itemStyle={{ color: "#94a3b8" }}
                                    />
                                    <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                                    <Bar dataKey="high"     stackId="a" fill="#f97316" name="High" />
                                    <Bar dataKey="medium"   stackId="a" fill="#f59e0b" name="Medium" />
                                    <Bar dataKey="low"      stackId="a" fill="#10b981" name="Low" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top packages */}
                        <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                            <p className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                <Box className="w-4 h-4 text-amber-400" /> Most Vulnerable Packages
                            </p>
                            <div className="space-y-2">
                                {topPackages.map(({ pkg, critical, high, total, repoCount }) => (
                                    <div key={pkg} className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/30">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-mono font-semibold text-slate-200 truncate">{pkg}</p>
                                            <p className="text-[10px] text-slate-500">{repoCount} repo{repoCount !== 1 ? "s" : ""}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {critical > 0 && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">{critical}C</span>}
                                            {high > 0 && <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">{high}H</span>}
                                            <span className="text-[10px] text-slate-500">{total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Severity breakdown bar */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Severity Distribution</p>
                        <div className="flex items-center gap-2 mb-2">
                            {(["critical", "high", "medium", "low"] as const).map(sev => {
                                const count = stats[sev];
                                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                const colors = { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-amber-500", low: "bg-emerald-500" };
                                return pct > 0 ? (
                                    <div key={sev} className={cn("h-3 rounded-full", colors[sev])} style={{ width: `${pct}%` }} title={`${sev}: ${count}`} />
                                ) : null;
                            })}
                        </div>
                        <div className="flex items-center gap-6 mt-2">
                            {(["critical", "high", "medium", "low"] as const).map(sev => {
                                const count = stats[sev];
                                const textColors = { critical: "text-red-400", high: "text-orange-400", medium: "text-amber-400", low: "text-emerald-400" };
                                return (
                                    <div key={sev} className="flex items-center gap-1.5">
                                        <div className={cn("w-2 h-2 rounded-full", { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-amber-500", low: "bg-emerald-500" }[sev])} />
                                        <span className={cn("text-xs font-semibold", textColors[sev])}>{count}</span>
                                        <span className="text-[10px] text-slate-500 capitalize">{sev}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Repo grouped view */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                            <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-amber-400" /> Vulnerability Findings
                            </p>
                            <div className="relative flex-1 min-w-[160px]">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search package, repo…"
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50" />
                            </div>
                            <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
                                className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                                <option value="all">All Severities</option>
                                {["critical", "high", "medium", "low"].map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                            <select value={filterRepo} onChange={e => setFilterRepo(e.target.value)}
                                className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                                <option value="all">All Repos</option>
                                {repos.map(r => <option key={r} value={r}>{r.split("/").pop() ?? r}</option>)}
                            </select>
                            <span className="text-xs text-slate-500 ml-auto">{filtered.length} finding{filtered.length !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Vulnerability</th>
                                        <th className="px-4 py-3 font-medium">Package</th>
                                        <th className="px-4 py-3 font-medium">Repository</th>
                                        <th className="px-4 py-3 font-medium">Ecosystem</th>
                                        <th className="px-4 py-3 font-medium">CVE / GHSA</th>
                                        <th className="px-4 py-3 font-medium">Severity</th>
                                        <th className="px-4 py-3 font-medium">Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-slate-500 text-sm">
                                                No findings match the current filters
                                            </td>
                                        </tr>
                                    ) : filtered.map(f => {
                                        const pkg = getPackageName(f);
                                        const eco = getEcosystem(f);
                                        const cve = getCVE(f);
                                        const sevCfg = SEV_CFG[f.severity.toLowerCase()] ?? SEV_CFG.medium;
                                        return (
                                            <tr key={f.id} className="hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-5 py-3 max-w-[220px]">
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", sevCfg.color)} />
                                                        <span className="text-xs text-slate-200 leading-relaxed">{f.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">{pkg}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400 font-mono truncate max-w-[120px] block">{f.repository.split("/").pop() ?? f.repository}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[11px] text-slate-500">{eco}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {cve ? (
                                                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">{cve}</span>
                                                    ) : <span className="text-[11px] text-slate-600">—</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <SeverityBadge severity={f.severity} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[11px] text-slate-500">{formatDate(f.updated_at)}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Repos accordion */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800/50">
                            <Lock className="w-4 h-4 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-200">Repository Breakdown</p>
                            <span className="ml-auto text-xs text-slate-500">{repos.length} repos affected</span>
                        </div>
                        {repoBreakdown.map(repo => {
                            const isOpen = expandedRepos.has(repo.fullName);
                            const repoFindings = findings.filter(f => f.repository === repo.fullName)
                                .sort((a, b) => { const o = { critical: 0, high: 1, medium: 2, low: 3 }; return (o[a.severity as keyof typeof o] ?? 4) - (o[b.severity as keyof typeof o] ?? 4); });
                            return (
                                <div key={repo.fullName} className="border-b border-slate-800/50 last:border-b-0">
                                    <button
                                        onClick={() => toggleRepo(repo.fullName)}
                                        className="flex items-center w-full px-5 py-3 hover:bg-slate-800/20 transition-colors gap-4"
                                    >
                                        <ChevronDown className={cn("w-4 h-4 text-slate-500 shrink-0 transition-transform", isOpen && "rotate-180")} />
                                        <span className="flex-1 text-sm font-medium text-slate-200 text-left truncate">{repo.fullName}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {repo.critical > 0 && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">{repo.critical} Critical</span>}
                                            {repo.high > 0 && <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">{repo.high} High</span>}
                                            <span className="text-xs text-slate-500">{repo.total} total</span>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-14 pb-4 space-y-1.5">
                                            {repoFindings.slice(0, 10).map(f => {
                                                const sevCfg = SEV_CFG[f.severity] ?? SEV_CFG.medium;
                                                return (
                                                    <div key={f.id} className={cn("flex items-center gap-3 p-2.5 rounded-xl border text-xs", sevCfg.bg, sevCfg.border)}>
                                                        <Package className={cn("w-3.5 h-3.5 shrink-0", sevCfg.color)} />
                                                        <span className="font-mono text-amber-300 shrink-0">{getPackageName(f)}</span>
                                                        <span className="text-slate-300 flex-1 truncate">{f.title}</span>
                                                        <SeverityBadge severity={f.severity} />
                                                    </div>
                                                );
                                            })}
                                            {repoFindings.length > 10 && (
                                                <p className="text-[11px] text-slate-500 pl-1">+{repoFindings.length - 10} more findings</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
