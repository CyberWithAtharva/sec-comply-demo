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

type MetricData = { title: string; value: string; trend: string; isPositive: boolean; };

const DATA_MAP: Record<string, MetricData[]> = {
    soc2: [
        { title: "Total Controls Passed", value: "0 / 51", trend: "0%", isPositive: true },
        { title: "Critical Vulnerabilities", value: "14", trend: "+2", isPositive: false },
        { title: "Evidence Coverage", value: "0%", trend: "0%", isPositive: true },
        { title: "Compliance Score", value: "0", trend: "0", isPositive: false },
    ],
    iso27001: [
        { title: "Total Controls Passed", value: "15 / 93", trend: "+2%", isPositive: true },
        { title: "Critical Vulnerabilities", value: "12", trend: "+4", isPositive: false },
        { title: "Evidence Coverage", value: "24%", trend: "+1%", isPositive: true },
        { title: "Compliance Score", value: "45", trend: "-2", isPositive: false },
    ],
    dpd: [
        { title: "Total Controls Passed", value: "45 / 60", trend: "+8%", isPositive: true },
        { title: "Critical Vulnerabilities", value: "0", trend: "-1", isPositive: true },
        { title: "Evidence Coverage", value: "95%", trend: "+2%", isPositive: true },
        { title: "Compliance Score", value: "98", trend: "+1", isPositive: true },
    ]
};

export function MetricsCardsWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = DATA_MAP[frameworkId] || DATA_MAP.soc2;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 col-span-full">
            <MetricCard
                title={data[0].title}
                value={data[0].value}
                trend={data[0].trend}
                isPositive={data[0].isPositive}
                icon={<ShieldCheck className="w-16 h-16 text-emerald-500" />}
                delay={0.1}
            />
            <MetricCard
                title={data[1].title}
                value={data[1].value}
                trend={data[1].trend}
                isPositive={data[1].isPositive}
                icon={<AlertTriangle className="w-16 h-16 text-red-500" />}
                delay={0.2}
            />
            <MetricCard
                title={data[2].title}
                value={data[2].value}
                trend={data[2].trend}
                isPositive={data[2].isPositive}
                icon={<FileCheck2 className="w-16 h-16 text-blue-500" />}
                delay={0.3}
            />
            <MetricCard
                title={data[3].title}
                value={data[3].value}
                trend={data[3].trend}
                isPositive={data[3].isPositive}
                icon={<Activity className="w-16 h-16 text-indigo-500" />}
                delay={0.4}
            />
        </div>
    );
}
