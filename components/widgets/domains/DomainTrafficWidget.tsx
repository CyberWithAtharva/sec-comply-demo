"use client";

import React from "react";
import { Activity, Globe2, MapPin } from "lucide-react";

export function DomainTrafficWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Request Origins</h3>
                </div>
                <Globe2 className="w-5 h-5 text-slate-600" />
            </div>

            <div className="flex-1 w-full relative min-h-[180px] rounded-xl overflow-hidden bg-slate-900/40 border border-slate-800/50 flex flex-col items-center justify-center">
                {/* Simulated Traffic Heatmap Base */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-no-repeat bg-center" />

                {/* Traffic Nodes */}
                <div className="absolute top-[35%] left-[25%]">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/30 animate-ping absolute -inset-1" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 relative z-10" />
                </div>
                <div className="absolute top-[30%] left-[48%]">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/30 animate-ping absolute -inset-2" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 relative z-10" />
                </div>
                <div className="absolute top-[45%] left-[75%]">
                    <div className="w-3 h-3 rounded-full bg-amber-500/30 animate-ping absolute -inset-0.5" />
                    <div className="w-2 h-2 rounded-full bg-amber-500 relative z-10" />
                </div>
                <div className="absolute top-[60%] left-[30%]">
                    <div className="w-8 h-8 rounded-full bg-red-500/30 animate-ping absolute -inset-3" />
                    <div className="w-2 h-2 rounded-full bg-red-500 relative z-10" />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs pt-4 border-t border-slate-800/50">
                <div className="flex items-center space-x-1.5 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span className="text-slate-300">EU Data Centers</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span className="text-slate-300">Anomalous Spike (SA)</span>
                </div>
            </div>
        </div>
    );
}
