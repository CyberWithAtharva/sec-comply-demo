"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck } from "lucide-react";
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

// Rich Cell Component with Tooltip
const HeatmapCell = ({ cell, category, delay }: { cell: any, category: string, delay: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    let bgClass = "bg-slate-800/40 border border-slate-700/30";
    if (cell.intensity > 0.8) bgClass = "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] border border-blue-400";
    else if (cell.intensity > 0.6) bgClass = "bg-blue-600/90 border border-blue-500/80";
    else if (cell.intensity > 0.4) bgClass = "bg-blue-800/80 border border-blue-700/60";
    else if (cell.intensity > 0.2) bgClass = "bg-blue-900/60 border border-blue-800/40";

    const compliancePercent = Math.round(cell.intensity * 100);
    const totalControls = Math.floor(20 + (cell.intensity * 30));
    const passedControls = Math.floor(totalControls * cell.intensity);
    const failedControls = totalControls - passedControls;

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay, duration: 0.4, type: "spring" }}
                className={cn("w-3.5 h-3.5 rounded-[3px] cursor-pointer transition-all duration-300 hover:scale-125 z-10 hover:z-20", bgClass)}
            />

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl z-50 pointer-events-none"
                    >
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900/95 border-b border-r border-slate-700/80 rotate-45" />

                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                            <span className="text-sm font-bold text-slate-100">{category}</span>
                            <span className={cn("text-xs font-black px-2 py-0.5 rounded flex items-center gap-1",
                                compliancePercent >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                                    compliancePercent >= 50 ? "bg-amber-500/20 text-amber-400" :
                                        "bg-red-500/20 text-red-400"
                            )}>
                                {compliancePercent}%
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Passed</span>
                                <span className="text-slate-200 font-semibold">{passedControls}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Gaps</span>
                                <span className="text-slate-200 font-semibold">{failedControls}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${compliancePercent}%` }} />
                            </div>
                            <div className="text-[10px] text-slate-500 text-center uppercase tracking-wider mt-2 pt-2 border-t border-slate-800/50">
                                Week {cell.week + 1}, Month {cell.month + 1}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function HeatmapWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const seedOffset = stringToSeed(frameworkId);

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
        <div className="glass-panel rounded-2xl p-6 flex flex-col col-span-full xl:col-span-2 h-full min-h-[320px] relative overflow-visible">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Compliance Density Matrix</h3>
                <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
                    <span>Low</span>
                    <div className="flex space-x-1.5">
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-slate-800/40 border border-slate-700/30" />
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-blue-900/60 border border-blue-800/40" />
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-blue-800/80 border border-blue-700/60" />
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-blue-600/90 border border-blue-500/80" />
                        <div className="w-3.5 h-3.5 rounded-[3px] bg-blue-500 border border-blue-400" />
                    </div>
                    <span>High</span>
                </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center overflow-x-auto no-scrollbar pb-6">
                <div className="min-w-[700px] flex flex-col justify-between h-full gap-4">
                    {/* Months Header */}
                    <div className="flex justify-between text-xs text-slate-500 font-semibold tracking-wider pl-20 pr-4">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                            <span key={m} className="w-14 text-center">{m}</span>
                        ))}
                    </div>

                    {/* Matrix Body */}
                    <div className="flex flex-col justify-around flex-1 gap-2.5 shrink-0 pt-2 pb-2 border-l border-slate-800/50 pl-4 ml-16 relative">
                        {/* Subtle decorative grid lines behind rows */}
                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px)', backgroundSize: '70px 100%' }} />

                        {["D Data", "A Access", "N Network", "E Endpoints"].map((label, rowIdx) => {
                            const [letter, ...words] = label.split(" ");
                            const category = words.join(" ");
                            return (
                                <div key={category} className="flex items-center gap-3 w-full">
                                    <div className="absolute left-[-4.5rem] flex items-center text-xs w-16 group">
                                        <span className="font-bold text-slate-500 group-hover:text-blue-400 transition-colors w-4">{letter}</span>
                                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors truncate">{category}</span>
                                    </div>
                                    <div className="flex flex-1 justify-between gap-1.5 w-full">
                                        {HEATMAP_DATA.map((monthData, mIdx) => (
                                            <div key={mIdx} className="flex gap-2">
                                                {monthData.map((cell, wIdx) => (
                                                    <HeatmapCell
                                                        key={`${rowIdx}-${mIdx}-${wIdx}`}
                                                        cell={cell}
                                                        category={category}
                                                        delay={(rowIdx * 0.05) + (mIdx * 0.02)}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
