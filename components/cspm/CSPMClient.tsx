"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    CloudCog, Cloud, AlertCircle, CheckCircle2, X, Plus,
    Search, RefreshCw, Trash2, RotateCcw, AlertTriangle,
    Shield, Server, Link2, ExternalLink, Clock
} from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AWSAccount {
    id: string;
    org_id: string;
    account_id: string;
    account_alias: string | null;
    role_arn: string;
    external_id: string;
    regions: string[];
    last_scan: string | null;
    status: string;
    error_message: string | null;
    created_at: string;
}

export interface AWSFinding {
    id: string;
    aws_account_id: string;
    rule_id: string;
    title: string;
    resource_arn: string | null;
    resource_type: string | null;
    resource_id: string | null;
    severity: string;
    status: string;
    details: Record<string, unknown> | null;
    first_seen: string;
    last_seen: string;
}

interface CSPMClientProps {
    initialAccounts: AWSAccount[];
    initialFindings: AWSFinding[];
    orgId: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    CRITICAL: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30" },
    HIGH:     { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
    MEDIUM:   { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    LOW:      { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    critical: { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30" },
    high:     { color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
    medium:   { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
    low:      { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

function SeverityBadge({ severity }: { severity: string }) {
    const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.medium;
    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", cfg.color, cfg.bg, cfg.border)}>
            {severity}
        </span>
    );
}

// ─── Connect AWS Account Modal ────────────────────────────────────────────────

interface ConnectModalProps {
    orgId: string;
    onClose: () => void;
    onConnected: (account: AWSAccount) => void;
}

const CLI_STEPS = [
    {
        label: "Create a read-only IAM user",
        cmd: "aws iam create-user --user-name seccomply-readonly",
    },
    {
        label: "Attach SecurityAudit policy",
        cmd: "aws iam attach-user-policy \\\n  --user-name seccomply-readonly \\\n  --policy-arn arn:aws:iam::aws:policy/SecurityAudit",
    },
    {
        label: "Attach ReadOnlyAccess policy",
        cmd: "aws iam attach-user-policy \\\n  --user-name seccomply-readonly \\\n  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess",
    },
    {
        label: "Generate access keys — copy the output",
        cmd: "aws iam create-access-key --user-name seccomply-readonly",
    },
];

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-600/60 text-slate-400 hover:text-slate-200 text-[10px] font-medium transition-colors"
        >
            {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Server className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function ConnectAWSModal({ orgId, onClose, onConnected }: ConnectModalProps) {
    const [step, setStep] = useState<"cli" | "creds">("cli");
    const [form, setForm] = useState({
        account_id: "", account_alias: "",
        access_key_id: "", secret_access_key: "",
        regions: "us-east-1",
    });
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSecret, setShowSecret] = useState(false);

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.account_id.trim() || !form.access_key_id.trim() || !form.secret_access_key.trim()) {
            setError("Account ID, Access Key ID, and Secret Access Key are all required.");
            return;
        }
        setVerifying(true); setError(null);

        const res = await fetch("/api/integrations/aws/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                org_id: orgId,
                account_id: form.account_id.trim(),
                account_alias: form.account_alias.trim() || null,
                access_key_id: form.access_key_id.trim(),
                secret_access_key: form.secret_access_key.trim(),
                regions: form.regions.split(",").map(r => r.trim()).filter(Boolean),
            }),
        });

        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "Connection failed."); setVerifying(false); return; }
        onConnected(json.account as AWSAccount);
        onClose();
    };

    const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50 sticky top-0 bg-slate-900 z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                            <Cloud className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-100">Connect AWS Account</h2>
                            <p className="text-xs text-slate-500">Create a read-only service account, then paste the credentials</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Step tabs */}
                    <div className="flex rounded-xl bg-slate-800/50 p-1 gap-1">
                        {(["cli", "creds"] as const).map((s, i) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStep(s)}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    step === s ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                {i + 1}. {s === "cli" ? "Run AWS CLI Commands" : "Enter Credentials"}
                            </button>
                        ))}
                    </div>

                    {step === "cli" ? (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400">
                                Run these commands in your terminal where the <span className="text-slate-200 font-mono">aws</span> CLI is configured for your account. This creates a read-only IAM user and generates access keys.
                            </p>

                            {CLI_STEPS.map((s, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/30 text-[10px] font-bold text-sky-400 flex items-center justify-center shrink-0">{i + 1}</span>
                                        <span className="text-xs text-slate-300 font-medium">{s.label}</span>
                                    </div>
                                    <div className="flex items-start gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                                        <pre className="flex-1 text-[11px] font-mono text-emerald-300 whitespace-pre overflow-x-auto">{s.cmd}</pre>
                                        <CopyButton text={s.cmd.replace(/\\\n\s+/g, " ")} />
                                    </div>
                                </div>
                            ))}

                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>The last command outputs <span className="font-mono font-semibold">AccessKeyId</span> and <span className="font-mono font-semibold">SecretAccessKey</span>. Copy both — the secret is only shown once.</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep("creds")}
                                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                I&apos;ve run the commands — Enter credentials <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleConnect} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">AWS Account ID *</label>
                                    <input type="text" value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
                                        placeholder="123456789012" className={inputCls} />
                                    <p className="text-[10px] text-slate-600 mt-1">From your AWS console top-right</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Alias</label>
                                    <input type="text" value={form.account_alias} onChange={e => setForm(f => ({ ...f, account_alias: e.target.value }))}
                                        placeholder="prod-account" className={inputCls} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Access Key ID *</label>
                                <input type="text" value={form.access_key_id} onChange={e => setForm(f => ({ ...f, access_key_id: e.target.value }))}
                                    placeholder="AKIAIOSFODNN7EXAMPLE" className={`${inputCls} font-mono`} />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Secret Access Key *</label>
                                <div className="relative">
                                    <input
                                        type={showSecret ? "text" : "password"}
                                        value={form.secret_access_key}
                                        onChange={e => setForm(f => ({ ...f, secret_access_key: e.target.value }))}
                                        placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                        className={`${inputCls} font-mono pr-10`}
                                    />
                                    <button type="button" onClick={() => setShowSecret(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Regions to Scan (comma-separated)</label>
                                <input type="text" value={form.regions} onChange={e => setForm(f => ({ ...f, regions: e.target.value }))}
                                    placeholder="us-east-1, us-west-2, eu-west-1" className={inputCls} />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setStep("cli")} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Back</button>
                                <button type="submit" disabled={verifying}
                                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center space-x-2 transition-colors">
                                    {verifying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                    <span>{verifying ? "Verifying connection…" : "Connect Account"}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CSPMClient({ initialAccounts, initialFindings, orgId }: CSPMClientProps) {
    const supabase = createClient();

    const [accounts, setAccounts] = useState<AWSAccount[]>(initialAccounts);
    const [findings, setFindings] = useState<AWSFinding[]>(initialFindings);
    const [showConnect, setShowConnect] = useState(false);
    const [scanning, setScanning] = useState<string | null>(null);
    const [scanErrors, setScanErrors] = useState<Record<string, string>>({});
    const [scanResults, setScanResults] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");
    const [filterSeverity, setFilterSeverity] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const stats = useMemo(() => {
        const critical = findings.filter(f => f.severity.toLowerCase() === "critical").length;
        const high = findings.filter(f => f.severity.toLowerCase() === "high").length;
        const open = findings.filter(f => f.status === "ACTIVE" || f.status === "active").length;
        const resolved = findings.filter(f => f.status === "RESOLVED" || f.status === "resolved").length;
        return { total: findings.length, critical, high, open, resolved };
    }, [findings]);

    const filtered = useMemo(() => findings.filter(f => {
        if (filterSeverity !== "all" && f.severity.toLowerCase() !== filterSeverity) return false;
        if (filterStatus !== "all" && f.status.toLowerCase() !== filterStatus) return false;
        if (search && !f.title.toLowerCase().includes(search.toLowerCase()) &&
            !(f.resource_id?.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    }), [findings, filterSeverity, filterStatus, search]);

    const handleConnected = (account: AWSAccount) => {
        setAccounts(prev => [account, ...prev]);
    };

    const handleDisconnect = async (id: string) => {
        await supabase.from("aws_accounts").delete().eq("id", id);
        setAccounts(prev => prev.filter(a => a.id !== id));
        setFindings(prev => prev.filter(f => f.aws_account_id !== id));
    };

    const handleScan = async (accountId: string) => {
        setScanning(accountId);
        setScanErrors(prev => { const n = { ...prev }; delete n[accountId]; return n; });
        setScanResults(prev => { const n = { ...prev }; delete n[accountId]; return n; });

        // Abort after 90 s so the browser never hangs indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90_000);

        try {
            const res = await fetch("/api/integrations/aws/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account_id: accountId }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const json = await res.json();

            if (!res.ok) {
                setScanErrors(prev => ({ ...prev, [accountId]: json.error ?? `Scan failed (${res.status})` }));
                return;
            }

            // API route returns findings server-side (bypasses client RLS restrictions)
            const storedFindings: AWSFinding[] = json.findings ?? [];
            setFindings(prev => [
                ...prev.filter(f => f.aws_account_id !== accountId),
                ...storedFindings,
            ]);

            const found = json.findings_found ?? storedFindings.length;
            setScanResults(prev => ({ ...prev, [accountId]: `Scan complete — ${found} finding${found !== 1 ? "s" : ""} found` }));

            // Update last_scan timestamp on the account card
            setAccounts(prev => prev.map(a =>
                a.id === accountId ? { ...a, last_scan: new Date().toISOString(), status: "active" } : a
            ));
        } catch (e: unknown) {
            clearTimeout(timeoutId);
            const isAbort = e instanceof Error && e.name === "AbortError";
            const msg = isAbort
                ? "Scan timed out after 90 seconds. Check your AWS credentials or try again."
                : (e instanceof Error ? e.message : "Scan request failed");
            setScanErrors(prev => ({ ...prev, [accountId]: msg }));
        } finally {
            setScanning(null);
        }
    };

    const noAccounts = accounts.length === 0;

    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <CloudCog className="w-8 h-8 mr-3 text-sky-500" />
                        Cloud Security Posture (CSPM)
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Monitor AWS misconfigurations and security findings in real-time.</p>
                </div>
                <button
                    onClick={() => setShowConnect(true)}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Connect AWS Account</span>
                </button>
            </div>

            {/* No accounts — big CTA */}
            {noAccounts ? (
                <div className="glass-panel rounded-2xl border border-slate-800/50 p-16 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6">
                        <Cloud className="w-10 h-10 text-sky-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-100 mb-2">No AWS Accounts Connected</h2>
                    <p className="text-sm text-slate-400 max-w-md mb-6">
                        Connect your AWS account using a cross-account IAM role. SecComply will scan for
                        misconfigurations, unused credentials, public resources, and compliance violations.
                    </p>
                    <button
                        onClick={() => setShowConnect(true)}
                        className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-colors flex items-center space-x-2"
                    >
                        <Link2 className="w-4 h-4" />
                        <span>Connect Your First AWS Account</span>
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Total Findings", count: stats.total,    color: "text-slate-100" },
                            { label: "Critical",        count: stats.critical, color: stats.critical > 0 ? "text-red-400" : "text-slate-400" },
                            { label: "High",            count: stats.high,     color: stats.high > 0 ? "text-orange-400" : "text-slate-400" },
                            { label: "Open",            count: stats.open,     color: stats.open > 0 ? "text-amber-400" : "text-slate-400" },
                        ].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                className="glass-panel rounded-2xl p-4 border border-slate-800/50 flex flex-col">
                                <span className="text-[10px] text-slate-500 mb-1">{s.label}</span>
                                <span className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.count}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Connected Accounts */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 p-5">
                        <div className="flex items-center space-x-2 mb-4">
                            <Cloud className="w-4 h-4 text-sky-400" />
                            <h3 className="text-sm font-semibold text-slate-100">Connected Accounts</h3>
                        </div>
                        <div className="flex flex-col space-y-3">
                            {accounts.map(acc => (
                                <div key={acc.id} className="flex flex-col rounded-xl border border-slate-800/50 overflow-hidden">
                                <div className="flex items-center justify-between p-4 bg-slate-900/40">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                                            <Cloud className="w-5 h-5 text-sky-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">
                                                {acc.account_alias ?? `Account ${acc.account_id}`}
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-mono">{acc.account_id}</p>
                                            {acc.error_message && (
                                                <p className="text-[11px] text-red-400 mt-0.5">{acc.error_message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] text-slate-500">Last Scan</p>
                                            <p className="text-xs text-slate-400" suppressHydrationWarning>
                                                {acc.last_scan ? new Date(acc.last_scan).toLocaleString("en-GB") : "Never"}
                                            </p>
                                        </div>
                                        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                            acc.status === "connected" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
                                                acc.status === "error" ? "text-red-400 bg-red-500/10 border-red-500/30" :
                                                    "text-amber-400 bg-amber-500/10 border-amber-500/30"
                                        )}>
                                            {acc.status}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <button onClick={() => handleScan(acc.id)} disabled={scanning === acc.id}
                                                className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                                                title="Trigger scan">
                                                <RefreshCw className={cn("w-4 h-4", scanning === acc.id && "animate-spin")} />
                                            </button>
                                            <button onClick={() => handleDisconnect(acc.id)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {scanErrors[acc.id] && (
                                    <div className="flex items-start gap-2 px-4 py-2.5 bg-red-500/5 border-t border-red-500/20 text-xs text-red-400">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>{scanErrors[acc.id]}</span>
                                    </div>
                                )}
                                {scanResults[acc.id] && !scanErrors[acc.id] && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border-t border-emerald-500/20 text-xs text-emerald-400">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>{scanResults[acc.id]}</span>
                                    </div>
                                )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Findings Table */}
                    <div className="glass-panel rounded-2xl border border-slate-800/50 flex flex-col">
                        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-slate-800/50">
                            <div className="relative flex-1 min-w-[180px]">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search findings…"
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none" />
                            </div>
                            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                                className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                                <option value="all">All Severities</option>
                                {["critical", "high", "medium", "low"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                            </select>
                            <span className="text-xs text-slate-500 ml-auto">{filtered.length} finding{filtered.length !== 1 ? "s" : ""}</span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Shield className="w-12 h-12 text-emerald-700 mb-3" />
                                <p className="text-sm font-medium text-emerald-400">No findings</p>
                                <p className="text-xs text-slate-600 mt-1">Run a scan to check for misconfigurations</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Finding</th>
                                            <th className="px-4 py-3 font-medium">Severity</th>
                                            <th className="px-4 py-3 font-medium">Resource</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {filtered.map(f => (
                                            <tr key={f.id} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-slate-200 font-medium">{f.title}</span>
                                                        <span className="text-[11px] text-slate-500 font-mono">{f.rule_id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-300">{f.resource_type ?? "—"}</span>
                                                        <span className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">{f.resource_id ?? f.resource_arn ?? "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[10px] uppercase font-bold",
                                                        f.status.toLowerCase() === "active" ? "text-red-400" : "text-emerald-400"
                                                    )}>{f.status}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-400" suppressHydrationWarning>
                                                        {new Date(f.last_seen).toLocaleDateString("en-GB")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showConnect && (
                    <ConnectAWSModal
                        orgId={orgId}
                        onClose={() => setShowConnect(false)}
                        onConnected={handleConnected}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
