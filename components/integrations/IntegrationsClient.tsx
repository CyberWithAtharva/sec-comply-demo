"use client";

import React, { useState } from "react";
import {
    Plug, CheckCircle2, AlertTriangle, Plus, ChevronRight,
    Cloud, GitBranch, Server, Shield, ExternalLink, RefreshCw,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import type { AWSAccount } from "@/components/cspm/CSPMClient";
import type { GitHubInstallation } from "@/components/github/GitHubClient";

interface IntegrationsClientProps {
    orgId: string;
    awsAccounts: AWSAccount[];
    githubInstalls: GitHubInstallation[];
}

// ─── Provider definitions ──────────────────────────────────────────────────────

interface Provider {
    id: string;
    name: string;
    description: string;
    logo: string;
    category: string;
    status: "available" | "coming_soon";
    href?: string;
}

const CLOUD_PROVIDERS: Provider[] = [
    {
        id: "aws",
        name: "Amazon Web Services",
        description: "IAM, S3, VPC, RDS, CloudTrail, KMS",
        logo: "aws",
        category: "cloud",
        status: "available",
        href: "/cspm",
    },
    {
        id: "azure",
        name: "Microsoft Azure",
        description: "VMs, Storage, Network, SQL",
        logo: "azure",
        category: "cloud",
        status: "coming_soon",
    },
    {
        id: "gcp",
        name: "Google Cloud Platform",
        description: "IAM, Compute, Storage, GKE, BigQuery",
        logo: "gcp",
        category: "cloud",
        status: "available",
        href: "/cspm",
    },
];

const SCM_PROVIDERS: Provider[] = [
    {
        id: "github",
        name: "GitHub",
        description: "Organizations, repositories, and Actions",
        logo: "github",
        category: "scm",
        status: "available",
        href: "/github",
    },
    {
        id: "gitlab",
        name: "GitLab",
        description: "Projects, pipelines, and merge requests",
        logo: "gitlab",
        category: "scm",
        status: "coming_soon",
    },
];

const IAM_PROVIDERS: Provider[] = [
    {
        id: "okta",
        name: "Okta",
        description: "SSO, MFA, and identity governance",
        logo: "okta",
        category: "iam",
        status: "coming_soon",
    },
    {
        id: "entra",
        name: "Microsoft Entra ID",
        description: "Azure AD, Conditional Access, PIM",
        logo: "entra",
        category: "iam",
        status: "coming_soon",
    },
    {
        id: "google-workspace",
        name: "Google Workspace",
        description: "Directory, admin console, and audit logs",
        logo: "google",
        category: "iam",
        status: "coming_soon",
    },
];

// ─── Logo component ────────────────────────────────────────────────────────────

function ProviderLogo({ logo, size = "md" }: { logo: string; size?: "sm" | "md" }) {
    const cls = size === "sm" ? "w-8 h-8 text-base" : "w-12 h-12 text-xl";
    const map: Record<string, { bg: string; text: string; label: string }> = {
        aws:     { bg: "bg-orange-500/15 border-orange-500/25", text: "text-orange-400", label: "AWS" },
        azure:   { bg: "bg-blue-500/15 border-blue-500/25",     text: "text-blue-400",   label: "Az" },
        gcp:     { bg: "bg-yellow-500/15 border-yellow-500/25", text: "text-yellow-400", label: "GCP" },
        github:  { bg: "bg-slate-500/20 border-slate-500/30",   text: "text-slate-200",  label: "GH" },
        gitlab:  { bg: "bg-orange-600/15 border-orange-600/25", text: "text-orange-500", label: "GL" },
        okta:    { bg: "bg-blue-600/15 border-blue-600/25",     text: "text-blue-400",   label: "OK" },
        entra:   { bg: "bg-blue-500/15 border-blue-500/25",     text: "text-blue-400",   label: "MS" },
        google:  { bg: "bg-green-500/15 border-green-500/25",   text: "text-green-400",  label: "GW" },
    };
    const cfg = map[logo] ?? { bg: "bg-slate-700/30 border-slate-600/30", text: "text-slate-400", label: "?" };
    return (
        <div className={cn("rounded-xl border flex items-center justify-center font-bold flex-shrink-0", cls, cfg.bg, cfg.text)}>
            {size === "sm" ? cfg.label.slice(0, 2) : cfg.label}
        </div>
    );
}

// ─── Connected badge ───────────────────────────────────────────────────────────

function ConnectedBadge({ count }: { count: number }) {
    return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/25 text-emerald-400 uppercase tracking-wider">
            {count} connected
        </span>
    );
}

// ─── Provider card ─────────────────────────────────────────────────────────────

interface ConnectedAccount {
    id: string;
    label: string;
    sublabel?: string;
    status: "connected" | "error" | "pending";
}

interface ProviderCardProps {
    provider: Provider;
    connectedAccounts?: ConnectedAccount[];
    onAddAccount?: () => void;
}

function ProviderCard({ provider, connectedAccounts = [], onAddAccount }: ProviderCardProps) {
    const connCount = connectedAccounts.length;
    const hasError = connectedAccounts.some(a => a.status === "error");

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 p-4">
                <ProviderLogo logo={provider.logo} />
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm font-semibold",
                        provider.status === "coming_soon" ? "text-slate-500" : "text-slate-100"
                    )}>{provider.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{provider.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {provider.status === "coming_soon" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-800 border-slate-700 text-slate-500 uppercase tracking-wider">
                            Coming Soon
                        </span>
                    ) : connCount > 0 ? (
                        <ConnectedBadge count={connCount} />
                    ) : (
                        <a
                            href={provider.href}
                            className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            Connect <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                    )}
                    {hasError && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </div>
            </div>

            {/* Connected account rows */}
            {connectedAccounts.length > 0 && (
                <div className="border-t border-slate-800/60">
                    {connectedAccounts.map(acc => (
                        <div key={acc.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-800/40 last:border-b-0 hover:bg-slate-800/20 transition-colors">
                            <span className={cn(
                                "w-2 h-2 rounded-full flex-shrink-0",
                                acc.status === "connected" ? "bg-emerald-500" :
                                acc.status === "error" ? "bg-red-500" : "bg-amber-500"
                            )} />
                            <span className="text-sm text-slate-200 flex-1">{acc.label}</span>
                            {acc.sublabel && <span className="text-xs text-slate-500">{acc.sublabel}</span>}
                            <span className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded border uppercase",
                                acc.status === "connected"
                                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                    : acc.status === "error"
                                    ? "text-red-400 bg-red-500/10 border-red-500/20"
                                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            )}>
                                {acc.status}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </div>
                    ))}
                    {onAddAccount && (
                        <button
                            onClick={onAddAccount}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs text-slate-500 hover:text-slate-300 transition-colors w-full"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add account
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function IntegrationsClient({ orgId: _, awsAccounts, githubInstalls }: IntegrationsClientProps) {
    const [refreshing, setRefreshing] = useState(false);

    // Build connected account rows for AWS
    const awsRows: ConnectedAccount[] = awsAccounts.map(acc => ({
        id: acc.id,
        label: acc.account_alias ?? acc.account_id,
        sublabel: acc.regions?.[0] ?? undefined,
        status: acc.status === "active" ? "connected" : acc.status === "error" ? "error" : "pending",
    }));

    // Build connected account rows for GitHub
    const githubRows: ConnectedAccount[] = githubInstalls.map(inst => ({
        id: inst.id,
        label: inst.github_org,
        sublabel: undefined,
        status: inst.status === "active" ? "connected" : inst.status === "error" ? "error" : "pending",
    }));

    // Summary stats
    const connectedProviders = (awsRows.length > 0 ? 1 : 0) + (githubRows.length > 0 ? 1 : 0);
    const errorCount = [...awsRows, ...githubRows].filter(r => r.status === "error").length;
    const totalProviders = CLOUD_PROVIDERS.filter(p => p.status === "available").length
        + SCM_PROVIDERS.filter(p => p.status === "available").length
        + IAM_PROVIDERS.filter(p => p.status === "available").length;

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 800));
        setRefreshing(false);
    };

    return (
        <div className="space-y-7">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Plug className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Integrations</h1>
                        <p className="text-sm text-slate-400 mt-0.5">Connect and manage your cloud, SCM, and identity providers.</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                    <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                    Refresh
                </button>
            </div>

            {/* Summary bar */}
            <div className="flex items-center gap-6 px-5 py-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-300">
                        <span className="font-semibold text-emerald-400">{connectedProviders} connected</span>
                    </span>
                </div>
                {errorCount > 0 && (
                    <>
                        <span className="text-slate-700">•</span>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-amber-400 font-semibold">{errorCount} needs attention</span>
                        </div>
                    </>
                )}
                <span className="ml-auto text-xs text-slate-500">
                    {connectedProviders} of {totalProviders} available providers connected
                </span>
            </div>

            {/* Cloud Security */}
            <div>
                <SectionHeader icon={Cloud} label="Cloud Security" />
                <div className="space-y-2">
                    <ProviderCard
                        provider={CLOUD_PROVIDERS[0]!}
                        connectedAccounts={awsRows}
                        onAddAccount={awsRows.length > 0 ? () => window.location.href = "/cspm" : undefined}
                    />
                    <ProviderCard provider={CLOUD_PROVIDERS[1]!} />
                    <ProviderCard provider={CLOUD_PROVIDERS[2]!} />
                </div>
            </div>

            {/* Source Code Management */}
            <div>
                <SectionHeader icon={GitBranch} label="Source Code Management" />
                <div className="space-y-2">
                    <ProviderCard
                        provider={SCM_PROVIDERS[0]!}
                        connectedAccounts={githubRows}
                        onAddAccount={githubRows.length > 0 ? () => window.location.href = "/github" : undefined}
                    />
                    <ProviderCard provider={SCM_PROVIDERS[1]!} />
                </div>
            </div>

            {/* Identity & Access Management */}
            <div>
                <SectionHeader icon={Shield} label="Identity & Access Management" />
                <div className="space-y-2">
                    {IAM_PROVIDERS.map(provider => (
                        <ProviderCard key={provider.id} provider={provider} />
                    ))}
                </div>
            </div>

            {/* Endpoint & Infrastructure — placeholders */}
            <div>
                <SectionHeader icon={Server} label="Endpoint & Infrastructure" />
                <div className="space-y-2">
                    {[
                        { id: "crowdstrike", name: "CrowdStrike Falcon", description: "Endpoint detection, threat intelligence, and vuln management" },
                        { id: "sentinelone", name: "SentinelOne", description: "Autonomous endpoint security and threat hunting" },
                    ].map(p => (
                        <ProviderCard key={p.id} provider={{ ...p, logo: "aws", category: "endpoint", status: "coming_soon" }} />
                    ))}
                </div>
            </div>

            {/* Footer note */}
            <div className="flex items-center gap-2 text-xs text-slate-600 pb-4">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>More integrations are added regularly. Contact support to request a specific integration.</span>
            </div>
        </div>
    );
}
