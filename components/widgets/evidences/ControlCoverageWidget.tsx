"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export function ControlCoverageWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Evidence Coverage</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                        <circle cx="64" cy="64" r="56" className="stroke-emerald-500" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * 84) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-slate-100">84%</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs relative z-10">
                <div className="bg-slate-900/40 border border-slate-800/50 p-2 rounded-lg">
                    <span className="block text-slate-200 font-bold text-lg">312</span>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">Attached File</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/50 p-2 rounded-lg">
                    <span className="block text-slate-200 font-bold text-lg">24</span>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">Missing Gaps</span>
                </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
