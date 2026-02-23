"use client";

import React from "react";
import { GraduationCap, ShieldCheck, Trophy } from "lucide-react";

export function TrainingCompletionWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Company Completion</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="64" className="stroke-slate-800" strokeWidth="12" fill="none" />
                        <circle cx="72" cy="72" r="64" className="stroke-emerald-500" strokeWidth="12" fill="none" strokeDasharray="402" strokeDashoffset={402 - (402 * 94) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-bold text-slate-100">94%</span>
                        <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-1">Compliant</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs relative z-10">
                <div className="bg-slate-900/40 border border-slate-800/50 p-2 rounded-lg flex flex-col items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="block text-slate-200 font-bold text-lg">412</span>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">Trained</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/50 p-2 rounded-lg flex flex-col items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="block text-slate-200 font-bold text-lg">Top 5%</span>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">Industry Rank</span>
                </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute top-1/4 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
