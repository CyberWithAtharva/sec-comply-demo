"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GitBranch, AlertCircle, CheckCircle2, X, Plus,
    Search, RefreshCw, Trash2, Shield, Lock, ExternalLink,
    Bug, Key, Code2, Clock, Package, ShieldAlert, ChevronDown,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, Treemap, Cell } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrgSecuritySettings {
    two_factor_required: boolean;
    default_repo_permission: string;
    members_can_create_public_repos: boolean;
    members_can_fork_private: boolean;
    actions_enabled: string | null;
    actions_allowed: string | null;
    outside_collaborators: number | null;
    members_without_2fa: number | null;
    plan: string | null;
    public_repos: number;
    private_repos: number;
    issues: { label: string; severity: "critical" | "high" | "medium" | "low" }[];
}

export interface GitHubInstallation {
    id: string;
    org_id: string;
    installation_id: number;
    github_org: string;
    status: string;
    last_sync: string | null;
    error_message: string | null;
    org_settings: OrgSecuritySettings | null;
    created_at: string;
}

export interface GitHubRepo {
    id: string;
    installation_id: string;
    repo_name: string;
    repo_id: number;
    private: boolean;
    default_branch: string;
    settings: Record<string, unknown>;
    compliance_issues: Record<string, unknown>;
    updated_at: string;
}

export interface GitHubFinding {
    id: string;
    installation_id: string;
    type: "secret" | "code_scan" | "dependabot" | "config";
    severity: "critical" | "high" | "medium" | "low";
    repository: string;
    title: string;
    details: Record<string, unknown>;
    state: string;
    external_id: string;
    updated_at: string;
}

// Severity for per-repo compliance issue control keys
const REPO_ISSUE_SEV: Record<string, "critical" | "high" | "medium" | "low"> = {
    "CC8.1":  "high",
    "CC6.6":  "medium",
    "CC6.7":  "medium",
    "CC6.7b": "low",
};

interface GitHubClientProps {
    initialInstallations: GitHubInstallation[];
    initialRepos: GitHubRepo[];
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

const TYPE_CFG = {
    secret:     { label: "Secret",          icon: Key,        color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30" },
    dependabot: { label: "Dependabot",      icon: Package,    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30" },
    code_scan:  { label: "Code Scan",       icon: Code2,      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    config:     { label: "Misconfiguration",icon: ShieldAlert, color: "text-orange-400",bg: "bg-orange-500/10", border: "border-orange-500/30" },
};

function SeverityBadge({ severity }: { severity: string }) {
    const cfg = SEV_CFG[severity.toLowerCase()] ?? SEV_CFG.medium;
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            {severity}
        </span>
    );
}

function TypeBadge({ type }: { type: "secret" | "code_scan" | "dependabot" | "config" }) {
    const cfg = TYPE_CFG[type] ?? TYPE_CFG.dependabot;
    const Icon = cfg.icon;
    return (
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            <Icon className="w-3 h-3" />{cfg.label}
        </span>
    );
}

function formatDate(d: string | null) {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Connect Modal ────────────────────────────────────────────────────────────

interface ConnectModalProps {
    orgId: string;
    onClose: () => void;
    onConnected: (inst: GitHubInstallation) => void;
}

function ConnectModal({ orgId, onClose, onConnected }: ConnectModalProps) {
    const [form, setForm] = useState({ github_org: "", access_token: "" });
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToken, setShowToken] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.github_org.trim() || !form.access_token.trim()) {
            setError("Both fields are required.");
            return;
        }
        setConnecting(true);
        setError(null);
        const res = await fetch("/api/integrations/github/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ org_id: orgId, ...form }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "Connection failed"); setConnecting(false); return; }
        onConnected(json.installation as GitHubInstallation);
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <GitBranch className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">Connect GitHub</h2>
                            <p className="text-xs text-slate-500">Connect via Personal Access Token</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub Organization / Username *</label>
                        <input
                            type="text"
                            value={form.github_org}
                            onChange={e => setForm(f => ({ ...f, github_org: e.target.value }))}
                            placeholder="my-org or my-username"
                            className={inputCls}
                        />
                        <p className="text-[10px] text-slate-600 mt-1">Your GitHub org name or personal username</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Personal Access Token *</label>
                        <div className="relative">
                            <input
                                type={showToken ? "text" : "password"}
                                value={form.access_token}
                                onChange={e => setForm(f => ({ ...f, access_token: e.target.value }))}
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                className={`${inputCls} font-mono pr-16`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                            >
                                {showToken ? "Hide" : "Show"}
                            </button>
                        </div>
                        <div className="mt-2 bg-slate-800/40 rounded-lg p-2.5 text-[10px] text-slate-400 space-y-1">
                            <p className="font-semibold text-slate-300">Required token scopes:</p>
                            <p><span className="font-mono bg-slate-700/60 px-1 rounded">repo</span> — read repos &amp; branch protection</p>
                            <p><span className="font-mono bg-slate-700/60 px-1 rounded">security_events</span> — Dependabot &amp; code scanning alerts</p>
                            <p><span className="font-mono bg-slate-700/60 px-1 rounded">read:org</span> — list org repos (if connecting an org)</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={connecting}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        {connecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                        {connecting ? "Connecting…" : "Connect GitHub"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GitHubClient({ initialInstallations, initialRepos, initialFindings, orgId }: GitHubClientProps) {
    const [installations, setInstallations] = useState<GitHubInstallation[]>(initialInstallations);
    const [repos, setRepos] = useState<GitHubRepo[]>(initialRepos);
    const [findings, setFindings] = useState<GitHubFinding[]>(initialFindings);
    const [showConnect, setShowConnect] = useState(false);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [syncErrors, setSyncErrors] = useState<Record<string, string>>({});
    const [syncResults, setSyncResults] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<"all" | "secret" | "dependabot" | "code_scan" | "config">("all");
    const [filterSev, setFilterSev] = useState("all");
    const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());

    // Synthesize config findings from org_settings.issues and per-repo compliance_issues
    const configFindings = useMemo<GitHubFinding[]>(() => {
        const result: GitHubFinding[] = [];
        for (const inst of installations) {
            const os = inst.org_settings;
            if (!os?.issues) continue;
            for (const issue of os.issues) {
                result.push({
                    id: `config-org-${inst.id}-${issue.label}`,
                    installation_id: inst.id,
                    type: "config",
                    severity: issue.severity,
                    repository: inst.github_org,
                    title: issue.label,
                    details: { source: "org_settings" },
                    state: "open",
                    external_id: `config-org-${inst.id}-${issue.label}`,
                    updated_at: inst.last_sync ?? inst.created_at,
                });
            }
        }
        for (const repo of repos) {
            const issues = Object.entries(repo.compliance_issues ?? {});
            for (const [key, val] of issues) {
                result.push({
                    id: `config-repo-${repo.id}-${key}`,
                    installation_id: repo.installation_id,
                    type: "config",
                    severity: REPO_ISSUE_SEV[key] ?? "medium",
                    repository: repo.repo_name,
                    title: val as string,
                    details: { control: key, source: "repo_settings" },
                    state: "open",
                    external_id: `config-repo-${repo.id}-${key}`,
                    updated_at: repo.updated_at,
                });
            }
        }
        return result;
    }, [installations, repos]);

    const stats = useMemo(() => {
        const allF = [...findings, ...configFindings];
        return {
            total: allF.length,
            secrets: findings.filter(f => f.type === "secret").length,
            dependabot: findings.filter(f => f.type === "dependabot").length,
            codeScan: findings.filter(f => f.type === "code_scan").length,
            configs: configFindings.length,
            critical: allF.filter(f => f.severity === "critical").length,
            high: allF.filter(f => f.severity === "high").length,
        };
    }, [findings, configFindings]);

    const filtered = useMemo(() => {
        const allF = [...findings, ...configFindings];
        return allF.filter(f => {
            if (filterType !== "all" && f.type !== filterType) return false;
            if (filterSev !== "all" && f.severity !== filterSev) return false;
            const q = search.toLowerCase();
            if (q && !f.title.toLowerCase().includes(q) && !f.repository.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [findings, configFindings, filterType, filterSev, search]);

    const reposByInstallation = useMemo(() => {
        const m = new Map<string, GitHubRepo[]>();
        for (const r of repos) {
            if (!m.has(r.installation_id)) m.set(r.installation_id, []);
            m.get(r.installation_id)!.push(r);
        }
        return m;
    }, [repos]);

    const ghDashboardData = useMemo(() => {
        const allF = [...findings, ...configFindings];

        const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 };
        for (const f of allF) {
            const s = f.severity.toLowerCase() as keyof typeof sevCounts;
            if (s in sevCounts) sevCounts[s]++;
        }

        const typeCounts = { secret: 0, dependabot: 0, code_scan: 0, config: 0 };
        for (const f of allF) {
            if (f.type in typeCounts) typeCounts[f.type as keyof typeof typeCounts]++;
        }

        // Per-repo finding breakdown
        const repoMap = new Map<string, { secret: number; dependabot: number; code_scan: number; config: number; critical: number; high: number; total: number }>();
        for (const f of allF) {
            if (!repoMap.has(f.repository)) repoMap.set(f.repository, { secret: 0, dependabot: 0, code_scan: 0, config: 0, critical: 0, high: 0, total: 0 });
            const e = repoMap.get(f.repository)!;
            if (f.type in e) (e as Record<string, number>)[f.type]++;
            e.total++;
            if (f.severity === "critical") e.critical++;
            if (f.severity === "high") e.high++;
        }
        const topRepos = [...repoMap.entries()]
            .sort((a, b) => (b[1].critical * 4 + b[1].high * 3 + b[1].total) - (a[1].critical * 4 + a[1].high * 3 + a[1].total))
            .slice(0, 5)
            .map(([name, v]) => ({ name, ...v, score: Math.max(0, 100 - Math.min(100, v.critical * 15 + v.high * 5 + v.total)) }));

        // Heatmap: top repos × type
        const heatmapRepos = [...repoMap.entries()]
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 8);

        // Per-installation scores
        const instScores = installations.map(inst => {
            const iF = allF.filter(f => f.installation_id === inst.id);
            const critical = iF.filter(f => f.severity === "critical").length;
            const high = iF.filter(f => f.severity === "high").length;
            const score = Math.max(0, 100 - Math.min(100, critical * 15 + high * 5 + iF.length));
            return { id: inst.id, name: inst.github_org, score, total: iF.length, critical, high };
        }).sort((a, b) => a.score - b.score);

        const topFindings = [...allF]
            .sort((a, b) => {
                const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                return (o[a.severity] ?? 4) - (o[b.severity] ?? 4);
            })
            .slice(0, 5);

        const radarData = [
            { subject: "Secrets",    count: typeCounts.secret },
            { subject: "Deps",       count: typeCounts.dependabot },
            { subject: "Code Scan",  count: typeCounts.code_scan },
            { subject: "Misconfig",  count: typeCounts.config },
        ];

        const treemapData = [
            { name: "Secrets",    size: typeCounts.secret },
            { name: "Dependabot", size: typeCounts.dependabot },
            { name: "Code Scan",  size: typeCounts.code_scan },
            { name: "Misconfig",  size: typeCounts.config },
        ].filter(d => d.size > 0);

        return { sevCounts, typeCounts, topRepos, heatmapRepos, instScores, topFindings, radarData, treemapData };
    }, [findings, configFindings, installations]);

    const handleSync = async (installationId: string) => {
        setSyncing(installationId);
        setSyncErrors(prev => { const n = { ...prev }; delete n[installationId]; return n; });
        setSyncResults(prev => { const n = { ...prev }; delete n[installationId]; return n; });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120_000);

        try {
            const res = await fetch("/api/integrations/github/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ installation_id: installationId }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const json = await res.json();
            if (!res.ok) {
                setSyncErrors(prev => ({ ...prev, [installationId]: json.error ?? `Sync failed (${res.status})` }));
                return;
            }

            // Update repos
            if (json.repos?.length > 0) {
                setRepos(prev => [
                    ...prev.filter(r => r.installation_id !== installationId),
                    ...(json.repos as GitHubRepo[]),
                ]);
            }

            // Update findings
            const newFindings: GitHubFinding[] = json.findings ?? [];
            setFindings(prev => [
                ...prev.filter(f => f.installation_id !== installationId),
                ...newFindings,
            ]);

            const found = json.findings_found ?? newFindings.length;
            setSyncResults(prev => ({
                ...prev,
                [installationId]: `Sync complete — ${json.repos_synced ?? 0} repo${(json.repos_synced ?? 0) !== 1 ? "s" : ""}, ${found} finding${found !== 1 ? "s" : ""}`,
            }));

            // Update org_settings on the installation record
            setInstallations(prev => prev.map(i =>
                i.id === installationId ? {
                    ...i,
                    last_sync: new Date().toISOString(),
                    status: "active",
                    org_settings: json.org_settings ?? i.org_settings,
                } : i
            ));
        } catch (e: unknown) {
            clearTimeout(timeoutId);
            const isAbort = e instanceof Error && e.name === "AbortError";
            setSyncErrors(prev => ({
                ...prev,
                [installationId]: isAbort
                    ? "Sync timed out after 2 minutes."
                    : (e instanceof Error ? e.message : "Sync failed"),
            }));
        } finally {
            setSyncing(null);
        }
    };

    const handleDisconnect = async (id: string) => {
        await fetch(`/api/integrations/github/disconnect`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ installation_id: id }),
        });
        setInstallations(prev => prev.filter(i => i.id !== id));
        setRepos(prev => prev.filter(r => r.installation_id !== id));
        setFindings(prev => prev.filter(f => f.installation_id !== id));
    };

    const noInstallations = installations.length === 0;

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <GitBranch className="w-8 h-8 mr-3 text-violet-400" />
                        GitHub Security
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Monitor Dependabot alerts, secret scanning, and code vulnerabilities.</p>
                </div>
                <button
                    onClick={() => setShowConnect(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Connect GitHub
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                {[
                    { label: "Total Findings", value: stats.total, color: "text-slate-100" },
                    { label: "Secrets", value: stats.secrets, color: "text-red-400" },
                    { label: "Dependabot", value: stats.dependabot, color: "text-amber-400" },
                    { label: "Code Scan", value: stats.codeScan, color: "text-purple-400" },
                    { label: "Misconfig", value: stats.configs, color: "text-orange-400" },
                    { label: "Critical", value: stats.critical, color: "text-red-400" },
                    { label: "High", value: stats.high, color: "text-orange-400" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4">
                        <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                        <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ─── Posture Dashboard ─── */}
            {stats.total > 0 && (
                <div className="space-y-6">
                    {/* Row 1: Per-Installation Score Cards */}
                    <div className="flex flex-wrap gap-4">
                        {ghDashboardData.instScores.map(inst => {
                            const circ = 2 * Math.PI * 36;
                            const strokeColor = inst.score >= 80 ? "#10b981" : inst.score >= 50 ? "#f59e0b" : "#ef4444";
                            return (
                                <div key={inst.id} className="glass-panel rounded-2xl border border-slate-800/50 p-5 flex flex-col items-center min-w-[140px] flex-1">
                                    <div className="relative">
                                        <svg width="80" height="80" viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="36" fill="none" stroke="#1e293b" strokeWidth="8" />
                                            <motion.circle
                                                cx="40" cy="40" r="36" fill="none"
                                                stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
                                                strokeDasharray={circ}
                                                initial={{ strokeDashoffset: circ }}
                                                animate={{ strokeDashoffset: circ * (1 - inst.score / 100) }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                transform="rotate(-90 40 40)"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-bold text-slate-100">{inst.score}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-300 truncate max-w-full mt-2 text-center">{inst.name}</span>
                                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                                        {inst.critical > 0 && <span className="text-red-400 font-medium">{inst.critical} crit</span>}
                                        {inst.high > 0 && <span className="text-orange-400 font-medium">{inst.high} high</span>}
                                        {inst.critical === 0 && inst.high === 0 && <span className="text-slate-500">{inst.total} total</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Row 2: Severity Bar — full width */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4">Findings by Severity</h3>
                        <div className="w-full h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { name: "Critical", count: ghDashboardData.sevCounts.critical },
                                        { name: "High",     count: ghDashboardData.sevCounts.high },
                                        { name: "Medium",   count: ghDashboardData.sevCounts.medium },
                                        { name: "Low",      count: ghDashboardData.sevCounts.low },
                                    ]}
                                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: "#0f172a" }} contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#f97316" />
                                        <Cell fill="#f59e0b" />
                                        <Cell fill="#10b981" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Row 3: Repo Heatmap + Radar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Repo × Type Heatmap */}
                        <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                            <h3 className="text-sm font-semibold text-slate-400 mb-4">Finding Type Heatmap by Repo</h3>
                            {ghDashboardData.heatmapRepos.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-xs text-slate-600">No repo data yet</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[10px]">
                                        <thead>
                                            <tr>
                                                <th className="text-left pr-4 pb-2 text-slate-500 font-medium">Repository</th>
                                                {["Secret", "Dep", "Code", "Config"].map(h => <th key={h} className="text-center pb-2 text-slate-500 font-medium w-12">{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/30">
                                            {ghDashboardData.heatmapRepos.map(([repo, v]) => {
                                                const maxV = Math.max(v.secret, v.dependabot, v.code_scan, v.config, 1);
                                                return (
                                                    <tr key={repo}>
                                                        <td className="pr-4 py-1.5 text-slate-300 font-mono truncate max-w-[120px]">{repo.split("/").pop() ?? repo}</td>
                                                        {([
                                                            { count: v.secret,     fill: "#ef4444" },
                                                            { count: v.dependabot, fill: "#f59e0b" },
                                                            { count: v.code_scan,  fill: "#a855f7" },
                                                            { count: v.config,     fill: "#f97316" },
                                                        ] as { count: number; fill: string }[]).map((cell, ci) => (
                                                            <td key={ci} className="text-center py-1.5">
                                                                <div
                                                                    className="mx-auto w-9 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white"
                                                                    style={{ backgroundColor: cell.count > 0 ? cell.fill : "transparent", border: cell.count === 0 ? "1px solid #1e293b" : "none", opacity: cell.count > 0 ? 0.4 + 0.6 * (cell.count / maxV) : 1 }}
                                                                >
                                                                    {cell.count > 0 ? cell.count : ""}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Radar */}
                        <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">Finding Type Distribution</h3>
                            <div className="w-full h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={ghDashboardData.radarData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                        <Radar name="Findings" dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                                        <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Top Findings Feed + Type Breakdown + Top Repos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Top Findings */}
                        <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                            <h3 className="text-sm font-semibold text-slate-400 mb-3">Top Findings</h3>
                            {ghDashboardData.topFindings.length === 0 ? (
                                <div className="flex flex-col items-center py-4">
                                    <Shield className="w-8 h-8 text-emerald-500/40 mb-2" />
                                    <p className="text-xs text-emerald-400">No findings</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {ghDashboardData.topFindings.map(f => (
                                        <div key={f.id} className="flex items-start gap-2 border-b border-slate-800/30 last:border-0 pb-2 last:pb-0">
                                            <SeverityBadge severity={f.severity} />
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-300 leading-tight line-clamp-2">{f.title}</p>
                                                <p className="text-[10px] text-slate-600 font-mono mt-0.5">{f.repository.split("/").pop()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Type Breakdown bars */}
                        <div className="glass-panel rounded-2xl border border-slate-800/50 p-5 flex flex-col">
                            <h3 className="text-sm font-semibold text-slate-400 mb-4">Findings by Type</h3>
                            <div className="flex-1 flex flex-col justify-center gap-4">
                                {([
                                    { label: "Secrets",    count: ghDashboardData.typeCounts.secret,     color: "bg-red-500",    textColor: "text-red-400" },
                                    { label: "Dependabot", count: ghDashboardData.typeCounts.dependabot, color: "bg-amber-500",  textColor: "text-amber-400" },
                                    { label: "Code Scan",  count: ghDashboardData.typeCounts.code_scan,  color: "bg-purple-500", textColor: "text-purple-400" },
                                    { label: "Misconfig",  count: ghDashboardData.typeCounts.config,     color: "bg-orange-500", textColor: "text-orange-400" },
                                ] as { label: string; count: number; color: string; textColor: string }[]).map(row => (
                                    <div key={row.label}>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className={row.textColor}>{row.label}</span>
                                            <span className="text-slate-300 font-semibold">{row.count}</span>
                                        </div>
                                        <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.total > 0 ? (row.count / stats.total) * 100 : 0}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={cn("h-full rounded-full", row.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Repos by Risk */}
                        <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                            <h3 className="text-sm font-semibold text-slate-400 mb-3">Repo Risk Ranking</h3>
                            <div className="space-y-3">
                                {ghDashboardData.topRepos.map((repo, i) => (
                                    <div key={repo.name} className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-600 w-3">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-slate-300 truncate">{repo.name.split("/").pop()}</span>
                                                <span className={cn("text-[10px] font-bold tabular-nums", repo.score >= 80 ? "text-emerald-400" : repo.score >= 50 ? "text-amber-400" : "text-red-400")}>
                                                    {repo.score}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", repo.score >= 80 ? "bg-emerald-500" : repo.score >= 50 ? "bg-amber-500" : "bg-red-500")}
                                                    style={{ width: `${repo.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Treemap — Findings by Type */}
                    {ghDashboardData.treemapData.length > 0 && (
                        <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                            <h3 className="text-sm font-semibold text-slate-400 mb-4">Findings Distribution by Type</h3>
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <Treemap data={ghDashboardData.treemapData} dataKey="size" stroke="#020617" fill="#7c3aed">
                                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }} />
                                    </Treemap>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Connected Installations */}
            <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Connected Accounts</h2>

                {noInstallations ? (
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                            <GitBranch className="w-7 h-7 text-violet-400" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1">No GitHub accounts connected</h3>
                        <p className="text-sm text-slate-500 mb-6">Connect your GitHub organization to scan for security issues.</p>
                        <button
                            onClick={() => setShowConnect(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Connect GitHub
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
                        {installations.map(inst => {
                            const instRepos = reposByInstallation.get(inst.id) ?? [];
                            const instFindings = findings.filter(f => f.installation_id === inst.id);
                            const isExpanded = expandedRepos.has(inst.id);
                            const hasRepoIssues = instRepos.some(r => Object.keys(r.compliance_issues ?? {}).length > 0);
                            const os = inst.org_settings;
                            const orgIssueCount = os?.issues?.length ?? 0;
                            const totalIssues = orgIssueCount + instRepos.reduce((acc, r) => acc + Object.keys(r.compliance_issues ?? {}).length, 0);

                            return (
                                <div key={inst.id}>
                                    <div className="flex items-center gap-4 px-5 py-4">
                                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                            <GitBranch className="w-4 h-4 text-violet-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-slate-100">{inst.github_org}</span>
                                                {totalIssues > 0 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                                                        {totalIssues} config issue{totalIssues !== 1 ? "s" : ""}
                                                    </span>
                                                )}
                                                {os && !os.two_factor_required && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-medium">
                                                        2FA not enforced
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                                                <span>{instRepos.length} repos</span>
                                                <span>·</span>
                                                <span>{instFindings.length} findings</span>
                                                {inst.last_sync && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Synced {formatDate(inst.last_sync)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[11px] font-semibold px-2.5 py-1 rounded-lg border",
                                            inst.status === "active"
                                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                                                : "text-amber-400 bg-amber-500/10 border-amber-500/30"
                                        )}>
                                            {inst.status.toUpperCase()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {(instRepos.length > 0 || inst.org_settings) && (
                                                <button
                                                    onClick={() => setExpandedRepos(s => {
                                                        const n = new Set(s);
                                                        n.has(inst.id) ? n.delete(inst.id) : n.add(inst.id);
                                                        return n;
                                                    })}
                                                    className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleSync(inst.id)}
                                                disabled={syncing === inst.id}
                                                className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                                                title="Sync"
                                            >
                                                <RefreshCw className={cn("w-4 h-4", syncing === inst.id && "animate-spin")} />
                                            </button>
                                            <button
                                                onClick={() => handleDisconnect(inst.id)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Disconnect"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error / success banners */}
                                    {syncErrors[inst.id] && (
                                        <div className="flex items-start gap-2 px-5 py-2.5 bg-red-500/5 border-t border-red-500/20 text-xs text-red-400">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            <span>{syncErrors[inst.id]}</span>
                                        </div>
                                    )}
                                    {syncResults[inst.id] && !syncErrors[inst.id] && (
                                        <div className="flex items-center gap-2 px-5 py-2 bg-emerald-500/5 border-t border-emerald-500/20 text-xs text-emerald-400">
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                            <span>{syncResults[inst.id]}</span>
                                        </div>
                                    )}

                                    {/* Expanded detail: org security + repos */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-800/60 bg-slate-950/40"
                                            >
                                                {/* ── Org-level security settings ── */}
                                                {os && (
                                                    <div className="px-5 pt-4 pb-3">
                                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Org Security Settings</p>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                                            {[
                                                                {
                                                                    label: "2FA Enforcement",
                                                                    ok: os.two_factor_required,
                                                                    good: "Enforced",
                                                                    bad: "Not enforced",
                                                                },
                                                                {
                                                                    label: "Default Member Permission",
                                                                    ok: os.default_repo_permission === "read" || os.default_repo_permission === "none",
                                                                    good: os.default_repo_permission,
                                                                    bad: os.default_repo_permission,
                                                                },
                                                                {
                                                                    label: "Private Repo Forking",
                                                                    ok: !os.members_can_fork_private,
                                                                    good: "Disabled",
                                                                    bad: "Allowed",
                                                                },
                                                                {
                                                                    label: "Actions Policy",
                                                                    ok: os.actions_allowed !== "all",
                                                                    good: os.actions_allowed ?? "n/a",
                                                                    bad: os.actions_allowed ?? "all (unrestricted)",
                                                                },
                                                                ...(os.outside_collaborators !== null ? [{
                                                                    label: "Outside Collaborators",
                                                                    ok: os.outside_collaborators === 0,
                                                                    good: "None",
                                                                    bad: `${os.outside_collaborators} collaborator${os.outside_collaborators !== 1 ? "s" : ""}`,
                                                                }] : []),
                                                                ...(os.members_without_2fa !== null ? [{
                                                                    label: "Members w/o 2FA",
                                                                    ok: os.members_without_2fa === 0,
                                                                    good: "All compliant",
                                                                    bad: `${os.members_without_2fa} member${os.members_without_2fa !== 1 ? "s" : ""}`,
                                                                }] : []),
                                                            ].map(c => (
                                                                <div key={c.label} className={cn(
                                                                    "rounded-lg p-2.5 border text-[10px]",
                                                                    c.ok
                                                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                                                        : "bg-red-500/5 border-red-500/20"
                                                                )}>
                                                                    <p className="text-slate-500 mb-0.5">{c.label}</p>
                                                                    <p className={cn("font-semibold", c.ok ? "text-emerald-400" : "text-red-400")}>
                                                                        {c.ok ? c.good : c.bad}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {/* Org plan + public/private counts */}
                                                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                                            {os.plan && <span>Plan: <span className="text-slate-400 capitalize">{os.plan}</span></span>}
                                                            <span>{os.public_repos} public · {os.private_repos} private repos</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ── Per-repo list ── */}
                                                {instRepos.length > 0 && (
                                                    <div className={cn("px-5 py-3 space-y-2", os && "border-t border-slate-800/40")}>
                                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Repositories</p>
                                                        {instRepos.map(repo => {
                                                            const issues = Object.entries(repo.compliance_issues ?? {});
                                                            const bp = repo.settings?.branch_protection as {
                                                                enabled?: boolean;
                                                                required_reviews?: number;
                                                                signed_commits?: boolean;
                                                                required_status_checks?: boolean;
                                                            } | undefined;
                                                            const archived = repo.settings?.archived as boolean | undefined;
                                                            return (
                                                                <div key={repo.id} className="flex items-start gap-3 py-2 border-b border-slate-800/30 last:border-0">
                                                                    <GitBranch className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-xs font-medium text-slate-300 truncate">{repo.repo_name}</span>
                                                                            {archived && <span className="text-[9px] text-slate-600 border border-slate-700/50 rounded px-1">archived</span>}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                            {bp?.enabled
                                                                                ? <span className="text-[10px] text-slate-500">{bp.required_reviews ?? 0} PR review{(bp.required_reviews ?? 0) !== 1 ? "s" : ""} · {bp.signed_commits ? "Signed ✓" : "Not signed"} · {bp.required_status_checks ? "Status checks ✓" : "No status checks"}</span>
                                                                                : <span className="text-[10px] text-amber-500">No branch protection</span>
                                                                            }
                                                                        </div>
                                                                        {issues.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {issues.map(([key, val]) => (
                                                                                    <span key={key} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">{val as string}</span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        {repo.private
                                                                            ? <span className="flex items-center gap-1 text-[10px] text-slate-500"><Lock className="w-3 h-3" />Private</span>
                                                                            : <span className="text-[10px] text-amber-400">Public</span>
                                                                        }
                                                                        {issues.length === 0
                                                                            ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"><Shield className="w-2.5 h-2.5" />OK</span>
                                                                            : <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">{issues.length} issue{issues.length !== 1 ? "s" : ""}</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Findings Table */}
            {!noInstallations && (
                <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Security Findings</h2>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search findings or repos…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-slate-800/60 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                        </div>

                        {/* Type filter */}
                        <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/60 rounded-xl p-1">
                            {(["all", "secret", "dependabot", "code_scan", "config"] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                        filterType === t ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
                                    )}
                                >
                                    {t === "all" ? "All Types" : t === "code_scan" ? "Code Scan" : t === "config" ? "Misconfig" : t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Severity filter */}
                        <select
                            value={filterSev}
                            onChange={e => setFilterSev(e.target.value)}
                            className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
                        >
                            <option value="all">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center">
                            <ShieldAlert className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                            <p className="text-base font-semibold text-emerald-400">
                                {stats.total === 0 ? "No findings yet" : "No findings match filters"}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {stats.total === 0 ? "Run a sync to check for security issues." : "Try adjusting your filters."}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800/60">
                                            <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Finding</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Repository</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {filtered.map(f => {
                                            const url = (f.details?.url ?? f.details?.html_url) as string | undefined;
                                            const pkg = f.details?.package as string | undefined;
                                            const cve = f.details?.cve_id as string | undefined;
                                            const tool = f.details?.tool as string | undefined;
                                            return (
                                                <tr key={f.id} className="hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <p className="text-slate-200 font-medium text-sm leading-snug">{f.title}</p>
                                                        {cve && <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{cve}</p>}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-xs text-slate-400 font-mono">{f.repository}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <TypeBadge type={f.type} />
                                                        {tool && <p className="text-[10px] text-slate-600 mt-1">{tool}</p>}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <SeverityBadge severity={f.severity} />
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                            {pkg && <span className="flex items-center gap-1"><Bug className="w-3 h-3" />{pkg}</span>}
                                                            {url && (
                                                                <a href={url} target="_blank" rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
                                                                    <ExternalLink className="w-3 h-3" /> View
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-5 py-3 border-t border-slate-800/40 text-xs text-slate-600">
                                {filtered.length} of {stats.total} findings
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Connect modal */}
            <AnimatePresence>
                {showConnect && (
                    <ConnectModal
                        orgId={orgId}
                        onClose={() => setShowConnect(false)}
                        onConnected={inst => setInstallations(prev => [inst, ...prev])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
