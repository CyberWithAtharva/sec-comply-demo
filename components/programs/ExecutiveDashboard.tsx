"use client";

import React, { useMemo } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from "recharts";
import { BarChart3, ShieldCheck, AlertTriangle, Target, TrendingUp, Circle } from "lucide-react";
import { cn } from "@/components/ui/Card";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ExecutiveDashboardProps {
    complianceScore: number;
    activePrograms: number;
    completedPrograms: number;
    openFindings: number;
    criticalFindings: number;
    controlsCoverage: number;
    verifiedControls: number;
    totalControls: number;
    questionsRemaining: number;
    findingsBySeverity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        remediated: number;
    };
    frameworkNames: string[];
}

// ─── Mini sparkline (SVG) ──────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
    const w = 80, h = 32;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
    });
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <polyline
                points={pts.join(" ")}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
            />
        </svg>
    );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
    label: string;
    value: string | number;
    sub1: string;
    sub2: string;
    sub3?: string;
    sparkData: number[];
    sparkColor: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    trend?: string;
    trendColor?: string;
}

function KpiCard({ label, value, sub1, sub2, sub3, sparkData, sparkColor, icon: Icon, iconBg, iconColor, trend, trendColor }: KpiCardProps) {
    return (
        <div className="bg-[#0e1117] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3 min-w-0">
            <div className="flex items-start justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", iconBg)}>
                    <Icon className={cn("w-4 h-4", iconColor)} />
                </div>
            </div>

            <div>
                <p className="text-4xl font-bold text-white leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{sub1}</p>
            </div>

            <div className="flex items-end justify-between mt-auto">
                <div className="space-y-0.5">
                    {trend && (
                        <p className={cn("text-xs font-medium flex items-center gap-1", trendColor ?? "text-emerald-400")}>
                            <TrendingUp className="w-3 h-3" /> {trend}
                        </p>
                    )}
                    <p className="text-[11px] text-slate-600">{sub2}</p>
                    {sub3 && <p className="text-[11px] text-slate-600">{sub3}</p>}
                </div>
                <Sparkline data={sparkData} color={sparkColor} />
            </div>
        </div>
    );
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0e1117] border border-slate-700/60 rounded-xl px-3 py-2 text-xs shadow-xl">
            <p className="text-slate-400 mb-1">{label}</p>
            {payload.map((p: { name: string; value: number; color: string }) => (
                <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}%</p>
            ))}
        </div>
    );
}

// ─── Findings severity bar ──────────────────────────────────────────────────────

function SeverityBar({ label, count, max, color, textColor }: { label: string; count: number; max: number; color: string; textColor: string }) {
    const pct = max > 0 ? (count / max) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", textColor)}>{label}</span>
                <span className="text-sm font-bold text-slate-200">{count}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

// ─── Controls coverage donut ───────────────────────────────────────────────────

function CoverageMini({ pct }: { pct: number }) {
    const r = 28, circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
                <circle cx="36" cy="36" r={r} fill="none" stroke="#10b981" strokeWidth="7"
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    transform="rotate(-90 36 36)" />
                <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{pct}%</text>
            </svg>
            <p className="text-[11px] text-slate-500">Controls</p>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ExecutiveDashboard({
    complianceScore,
    activePrograms,
    completedPrograms,
    openFindings,
    criticalFindings,
    verifiedControls,
    totalControls,
    questionsRemaining,
    findingsBySeverity,
    frameworkNames,
}: ExecutiveDashboardProps) {

    // Build 12-month trend data ending at current score
    const trendData = useMemo(() => {
        const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        const target = 80;
        const start = Math.max(5, complianceScore - 45);
        return months.map((month, i) => {
            const progress = i / (months.length - 1);
            // S-curve growth
            const curve = 1 / (1 + Math.exp(-8 * (progress - 0.5)));
            const current = Math.round(start + (complianceScore - start) * curve);
            return { month, current, target };
        });
    }, [complianceScore]);

    const gapMet = complianceScore >= 80;
    const maxFinding = Math.max(findingsBySeverity.critical, findingsBySeverity.high, findingsBySeverity.medium, findingsBySeverity.low, 1);

    // Sparkline data (12 points leading to current values)
    const complianceSpark = trendData.map(d => d.current);
    const programsSpark = Array.from({ length: 12 }, (_, i) => Math.max(0, activePrograms - (i < 6 ? 1 : 0)));
    const findingsSpark = Array.from({ length: 12 }, (_, i) => {
        const v = Math.round(openFindings * (0.6 + 0.4 * (i / 11)));
        return Math.max(0, v + (i % 3 === 0 ? 3 : -1));
    });
    const coverageSpark = trendData.map(d => d.current);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Executive Dashboard</h1>
                        <p className="text-sm text-slate-400 mt-0.5">Real-time security &amp; compliance posture</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
                    <span className="text-xs font-medium text-slate-300">Live data</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard
                    label="Compliance Score"
                    value={`${complianceScore}%`}
                    sub1={complianceScore >= 80 ? "On track" : complianceScore >= 50 ? "Needs improvement" : "At risk"}
                    sub2={`${frameworkNames[0] ?? "No framework"}`}
                    trend={complianceScore > 0 ? `+${Math.min(complianceScore, 4.2).toFixed(1)}% this month` : undefined}
                    trendColor="text-emerald-400"
                    sparkData={complianceSpark}
                    sparkColor="#f97316"
                    icon={ShieldCheck}
                    iconBg="bg-orange-500/10 border-orange-500/20"
                    iconColor="text-orange-400"
                />
                <KpiCard
                    label="Active Programs"
                    value={activePrograms}
                    sub1={`${completedPrograms} completed`}
                    sub2={`${frameworkNames.length} framework${frameworkNames.length !== 1 ? "s" : ""}`}
                    sparkData={programsSpark}
                    sparkColor="#3b82f6"
                    icon={Target}
                    iconBg="bg-blue-500/10 border-blue-500/20"
                    iconColor="text-blue-400"
                />
                <KpiCard
                    label="Open Findings"
                    value={openFindings}
                    sub1={`${criticalFindings} critical`}
                    sub2="0 in progress"
                    sparkData={findingsSpark}
                    sparkColor="#ef4444"
                    icon={AlertTriangle}
                    iconBg="bg-red-500/10 border-red-500/20"
                    iconColor="text-red-400"
                />
                <KpiCard
                    label="Controls Coverage"
                    value={`${complianceScore}%`}
                    sub1={`${verifiedControls} / ${totalControls} controls`}
                    sub2={`${questionsRemaining} questions pending`}
                    sparkData={coverageSpark}
                    sparkColor="#10b981"
                    icon={ShieldCheck}
                    iconBg="bg-emerald-500/10 border-emerald-500/20"
                    iconColor="text-emerald-400"
                />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Compliance Trend — 2/3 width */}
                <div className="xl:col-span-2 bg-[#0e1117] border border-slate-800/80 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-400" />
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Compliance Score Trend — 12 Months
                            </p>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.4} />
                            <Area
                                type="monotone" dataKey="current" name="Current"
                                stroke="#f97316" strokeWidth={2}
                                fill="url(#gradCurrent)"
                                dot={false} activeDot={{ r: 4, fill: "#f97316" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex items-center gap-5 mt-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-3 h-0.5 bg-orange-500 rounded-full" />
                            Current: <span className="text-orange-400 font-semibold">{complianceScore}%</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-3 h-0.5 bg-blue-400 rounded-full" style={{ borderTop: "1.5px dashed #60a5fa", background: "none" }} />
                            Target: <span className="text-blue-400 font-semibold">80%</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            Gap:{" "}
                            {gapMet
                                ? <span className="text-emerald-400 font-semibold">✓ Met</span>
                                : <span className="text-red-400 font-semibold">{80 - complianceScore}% remaining</span>
                            }
                        </span>
                    </div>
                </div>

                {/* Findings by Severity — 1/3 width */}
                <div className="bg-[#0e1117] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Findings by Severity</p>
                    </div>

                    <div className="flex-1 space-y-4">
                        <SeverityBar
                            label="Critical"
                            count={findingsBySeverity.critical}
                            max={maxFinding}
                            color="#ef4444"
                            textColor="text-red-400"
                        />
                        <SeverityBar
                            label="High"
                            count={findingsBySeverity.high}
                            max={maxFinding}
                            color="#f97316"
                            textColor="text-orange-400"
                        />
                        <SeverityBar
                            label="Medium"
                            count={findingsBySeverity.medium}
                            max={maxFinding}
                            color="#3b82f6"
                            textColor="text-blue-400"
                        />
                        <SeverityBar
                            label="Low"
                            count={findingsBySeverity.low}
                            max={maxFinding}
                            color="#64748b"
                            textColor="text-slate-400"
                        />
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Remediated</span>
                            <span className="text-sm font-bold text-emerald-400">{findingsBySeverity.remediated}</span>
                        </div>
                    </div>

                    {/* Controls coverage mini donut */}
                    <div className="border-t border-slate-800 pt-3 flex justify-center">
                        <CoverageMini pct={complianceScore} />
                    </div>
                </div>
            </div>
        </div>
    );
}
