"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/components/ui/Card";

const CATEGORIES = ["AWS", "Azure", "GCP", "On-Premise"];
const SUBCATEGORIES = [
    "IAM",
    "Network Security",
    "Data Protection",
    "Encryption",
    "Logging & Monitoring",
    "Incident Response",
];

// Seeded random for deterministic colors per evidence item
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const stringToSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

function getIntensityClass(value: number): string {
    if (value >= 0.85) return "bg-emerald-500/90 text-emerald-50";
    if (value >= 0.7) return "bg-emerald-600/70 text-emerald-100";
    if (value >= 0.5) return "bg-teal-600/60 text-teal-100";
    if (value >= 0.35) return "bg-amber-500/60 text-amber-100";
    if (value >= 0.2) return "bg-orange-500/50 text-orange-100";
    return "bg-red-500/40 text-red-100";
}

function getIntensityLabel(value: number): string {
    if (value >= 0.85) return "Strong";
    if (value >= 0.7) return "Good";
    if (value >= 0.5) return "Partial";
    if (value >= 0.35) return "Weak";
    if (value >= 0.2) return "Low";
    return "Gap";
}

interface EvidenceCategoryHeatmapProps {
    evidenceId: string;
}

export function EvidenceCategoryHeatmap({ evidenceId }: EvidenceCategoryHeatmapProps) {
    const baseSeed = stringToSeed(evidenceId);

    // Generate deterministic heatmap data
    const heatmapData = React.useMemo(() => {
        return CATEGORIES.map((cat, catIdx) =>
            SUBCATEGORIES.map((_, subIdx) => {
                return seededRandom(baseSeed + catIdx * 100 + subIdx * 17);
            })
        );
    }, [baseSeed]);

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
        >
            <div className="pt-4 pb-2">
                {/* Legend */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Coverage Heatmap</span>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                        <span>Gap</span>
                        <div className="flex space-x-0.5">
                            <div className="w-3 h-3 rounded-sm bg-red-500/40" />
                            <div className="w-3 h-3 rounded-sm bg-orange-500/50" />
                            <div className="w-3 h-3 rounded-sm bg-amber-500/60" />
                            <div className="w-3 h-3 rounded-sm bg-teal-600/60" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-600/70" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-500/90" />
                        </div>
                        <span>Strong</span>
                    </div>
                </div>

                {/* Column Headers */}
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "90px repeat(6, 1fr)" }}>
                    <div /> {/* Empty corner cell */}
                    {SUBCATEGORIES.map((sub) => (
                        <div
                            key={sub}
                            className="text-[10px] font-medium text-slate-500 text-center px-1 truncate"
                            title={sub}
                        >
                            {sub}
                        </div>
                    ))}

                    {/* Data Rows */}
                    {CATEGORIES.map((cat, catIdx) => (
                        <React.Fragment key={cat}>
                            <div className="text-xs font-semibold text-slate-300 flex items-center pr-2 truncate" title={cat}>
                                {cat}
                            </div>
                            {heatmapData[catIdx].map((value, subIdx) => (
                                <motion.div
                                    key={`${catIdx}-${subIdx}`}
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: catIdx * 0.06 + subIdx * 0.04,
                                        duration: 0.3,
                                        ease: "easeOut",
                                    }}
                                    className={cn(
                                        "rounded-lg h-10 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:ring-1 hover:ring-white/20 hover:shadow-lg",
                                        getIntensityClass(value)
                                    )}
                                    title={`${cat} → ${SUBCATEGORIES[subIdx]}: ${Math.round(value * 100)}%`}
                                >
                                    <span className="text-[10px] font-bold opacity-90">
                                        {getIntensityLabel(value)}
                                    </span>
                                </motion.div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
