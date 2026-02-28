"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertTriangle, FileCheck2 } from "lucide-react";
import { cn } from "../ui/Card";

interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    isPositive: boolean;
    icon: React.ReactNode;
    delay?: number;
}

function MetricCard({ title, value, trend, isPositive, icon, delay = 0 }: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className="glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                {icon}
            </div>
            <div className="flex flex-col z-10">
                <span className="text-sm font-medium text-slate-400 mb-2">{title}</span>
                <span className="text-3xl font-bold text-slate-100 tracking-tight">{value}</span>
            </div>
            <div className="mt-4 flex items-center text-xs font-mono font-medium z-10">
                <span className={cn("px-2 py-0.5 rounded-full border", isPositive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20")}>
                    {trend}
                </span>
                <span className="ml-2 text-slate-500">vs last assessment</span>
            </div>
        </motion.div>
    );
}

export interface FrameworkStats {
    totalControls: number;
    verifiedControls: number;
    inProgressControls: number;
    notStartedControls: number;
    evidenceCount: number;
    percentage: number;
}

interface MetricsCardsWidgetProps {
    frameworkId?: string;
    stats?: FrameworkStats;
}

export function MetricsCardsWidget({ stats }: MetricsCardsWidgetProps) {
    const total = stats?.totalControls ?? 0;
    const verified = stats?.verifiedControls ?? 0;
    const inProgress = stats?.inProgressControls ?? 0;
    const evidenceCount = stats?.evidenceCount ?? 0;
    const pct = stats?.percentage ?? 0;
    const notStarted = Math.max(0, total - verified - inProgress);
    const evidenceCoverage = total > 0 ? Math.min(100, Math.round((evidenceCount / total) * 100)) : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 col-span-full">
            <MetricCard
                title="Controls Verified"
                value={`${verified} / ${total}`}
                trend={`${pct}%`}
                isPositive={pct >= 50}
                icon={<ShieldCheck className="w-16 h-16 text-emerald-500" />}
                delay={0.1}
            />
            <MetricCard
                title="Not Started"
                value={String(notStarted)}
                trend={notStarted === 0 ? "All done" : `${notStarted} remaining`}
                isPositive={notStarted === 0}
                icon={<AlertTriangle className="w-16 h-16 text-red-500" />}
                delay={0.2}
            />
            <MetricCard
                title="Evidence Artifacts"
                value={String(evidenceCount)}
                trend={`${evidenceCoverage}% coverage`}
                isPositive={evidenceCoverage >= 50}
                icon={<FileCheck2 className="w-16 h-16 text-blue-500" />}
                delay={0.3}
            />
            <MetricCard
                title="In Progress"
                value={String(inProgress)}
                trend={inProgress > 0 ? "Active" : "None active"}
                isPositive={inProgress > 0}
                icon={<Activity className="w-16 h-16 text-indigo-500" />}
                delay={0.4}
            />
        </div>
    );
}
