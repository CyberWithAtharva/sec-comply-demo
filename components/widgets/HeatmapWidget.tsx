"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../ui/Card";

const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const stringToSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

// Data is now generated efficiently inside component so it reacts to framework.

export function HeatmapWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const seedOffset = stringToSeed(frameworkId);

    // Memoize the heatmap data generation so it only recalculates when framework changes
    const HEATMAP_DATA = React.useMemo(() => {
        return Array.from({ length: 12 }, (_, month) => {
            return Array.from({ length: 5 }, (_, w) => ({
                week: w,
                month,
                intensity: seededRandom(seedOffset + month * 10 + w)
            }));
        });
    }, [seedOffset]);

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col col-span-full xl:col-span-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Compliance Density Matrix</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>Low</span>
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-sm bg-slate-800" />
                        <div className="w-3 h-3 rounded-sm bg-blue-900/50" />
                        <div className="w-3 h-3 rounded-sm bg-blue-800/60" />
                        <div className="w-3 h-3 rounded-sm bg-blue-600/80" />
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    </div>
                    <span>High</span>
                </div>
            </div>

            <div className="flex-1 w-full overflow-x-auto no-scrollbar">
                <div className="min-w-[700px] flex flex-col gap-2">
                    {/* Months Header */}
                    <div className="flex justify-between text-xs text-slate-500 font-medium pl-8 pr-2">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                            <span key={m} className="w-12 text-center">{m}</span>
                        ))}
                    </div>

                    {/* Matrix Body */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                        {["Data", "Access", "Network", "Endpoints"].map((category, rowIdx) => (
                            <div key={category} className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 w-16 truncate text-right pr-2">{category}</span>
                                <div className="flex flex-1 gap-1.5">
                                    {HEATMAP_DATA.map((monthData, mIdx) => (
                                        <div key={mIdx} className="flex gap-1.5">
                                            {monthData.map((cell, wIdx) => {
                                                // Generate colors based on intensity mapping
                                                let bgClass = "bg-slate-800/50 hover:bg-slate-700";
                                                if (cell.intensity > 0.8) bgClass = "bg-blue-500 hover:bg-blue-400";
                                                else if (cell.intensity > 0.6) bgClass = "bg-blue-600/80 hover:bg-blue-500/80";
                                                else if (cell.intensity > 0.4) bgClass = "bg-blue-800/60 hover:bg-blue-700/60";
                                                else if (cell.intensity > 0.2) bgClass = "bg-blue-900/50 hover:bg-blue-800/50";

                                                return (
                                                    <motion.div
                                                        key={`${rowIdx}-${mIdx}-${wIdx}`}
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: (rowIdx * 0.05) + (mIdx * 0.02), duration: 0.3 }}
                                                        className={cn("w-3 h-3 rounded-[3px] cursor-pointer transition-colors duration-300", bgClass)}
                                                        title={`${category} compliance level: ${Math.round(cell.intensity * 100)}%`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
