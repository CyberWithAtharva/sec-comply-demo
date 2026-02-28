"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Target, TrendingUp, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { HeatmapWidget } from "@/components/widgets/HeatmapWidget";

// Import Kickass Overview Widgets
import { CostEstimatorWidget } from "@/components/widgets/overview/CostEstimatorWidget";
import { ExecutiveSummaryWidget } from "@/components/widgets/overview/ExecutiveSummaryWidget";
import { RealtimeAnomalyFeed } from "@/components/widgets/overview/RealtimeAnomalyFeed";
import { GeographicThreatMap } from "@/components/widgets/overview/GeographicThreatMap";
import { BurnRateChart } from "@/components/widgets/overview/BurnRateChart";

interface OverviewProps {
    activeFramework: string;
    setActiveFramework: React.Dispatch<React.SetStateAction<string>>;
    frameworks: {
        id: string;
        title: string;
        subtitle: string;
        value: number;
        status: "Critical" | "Warning" | "Good";
        colorClass: string;
    }[];
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    activeFrameworkData?: {
        totalControls: number;
        verifiedControls: number;
        inProgressControls: number;
        notStartedControls: number;
        evidenceCount: number;
        percentage: number;
    };
}

export function OverviewTab({ activeFramework, setActiveFramework, frameworks, setIsModalOpen, activeFrameworkData }: OverviewProps) {
    // Compute global posture score from all frameworks (average) or from active framework
    const totalControls = activeFrameworkData?.totalControls ?? 0;
    const verifiedControls = activeFrameworkData?.verifiedControls ?? 0;
    const inProgressControls = activeFrameworkData?.inProgressControls ?? 0;
    const score = activeFrameworkData ? activeFrameworkData.percentage : 0;
    const riskCount = totalControls > 0 ? (totalControls - verifiedControls - inProgressControls) : 0;

    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6"
        >
            {/* Top Row: Framework Progress Cards */}
            <div className="flex flex-col md:flex-row gap-6">
                {frameworks.map((fw, idx) => (
                    <motion.div
                        key={fw.id}
                        className="flex-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                    >
                        <CircularProgress
                            value={fw.value}
                            title={fw.title}
                            subtitle={fw.subtitle}
                            status={fw.status}
                            colorClass={fw.colorClass}
                            isActive={activeFramework === fw.id}
                            onClick={() => {
                                setActiveFramework(fw.id);
                                setIsModalOpen(true);
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Middle Row A: Executive AI, Global Posture, Quick Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                    <ExecutiveSummaryWidget />
                </div>

                {/* Master Score */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group lg:col-span-1">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="z-10 flex flex-col h-full justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Global Posture</h3>
                            <div className="mt-2 flex items-baseline space-x-3">
                                <span className="text-5xl font-bold text-slate-100 tracking-tighter">{score}</span>
                                <span className="text-xl text-slate-500 font-medium">/ 100</span>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">{verifiedControls} verified controls</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-400">
                                <span>Target: <span className="text-slate-200">90%</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Risk Stat */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between lg:col-span-1">
                    <div>
                        <div className="flex flex-row items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Critical Risks</h3>
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-5xl font-bold text-slate-100 tracking-tighter">{riskCount}</span>
                    </div>
                    <button className="mt-6 w-full flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-slate-800 text-sm text-slate-200 py-2.5 rounded-lg border border-slate-700/50 transition-colors">
                        <span>Details</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Middle Row B: Heatmap & Burn Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[300px]">
                    <HeatmapWidget frameworkId={activeFramework} />
                </div>
                <div className="h-[300px]">
                    <BurnRateChart />
                </div>
            </div>

            {/* Bottom Row A: Geo-Threat Map, Anomaly Feed, Actionable Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Geographic Threat Map */}
                <div className="lg:col-span-1 min-h-[300px]">
                    <GeographicThreatMap />
                </div>

                {/* Anomaly Feed */}
                <div className="lg:col-span-1 min-h-[300px]">
                    <RealtimeAnomalyFeed />
                </div>

                {/* Action steps */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 lg:col-span-1 min-h-[300px]">
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-slate-100">Next Actionable Steps</h3>
                        <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded">3 Pending</span>
                    </div>

                    <div className="flex flex-col space-y-3">
                        {[
                            { title: "Review Identity Governance Policies", time: "Due in 2 days", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                            { title: "Upload SOC 2 Type II Pen Test Evidence", time: "Due in 5 days", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                            { title: "Complete Endpoint Security Rollout", time: "Due in 1 week", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                        ].map((act, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/40 transition-colors cursor-pointer group">
                                <div className="flex items-center space-x-4">
                                    <div className={cn("p-2 rounded-lg border", act.bg, act.border)}>
                                        <act.icon className={cn("w-5 h-5", act.color)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{act.title}</span>
                                        <span className="text-xs text-slate-500 mt-0.5">{act.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row B: Cost Estimator */}
            <div className="grid grid-cols-1">
                <CostEstimatorWidget />
            </div>
        </motion.div>
    );
}
