"use client";

import React from "react";
import { BrainCircuit, Sparkles } from "lucide-react";

export function ExecutiveSummaryWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50 relative overflow-hidden group">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 opacity-50" />
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2" />

            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Executive Summary</h3>
                </div>
                <Sparkles className="w-4 h-4 text-cyan-500/50" />
            </div>

            <div className="text-sm text-slate-400 leading-relaxed z-10 space-y-4">
                <p>
                    <strong className="text-slate-200 font-medium">Global posture remains resilient at 84%.</strong>
                    Over the last 30 days, OmniGuard detected a 12% reduction in unmanaged assets.
                    However, <span className="text-amber-400 bg-amber-500/10 px-1 rounded">SOC 2 Type II</span> gap analysis indicates
                    we are severely behind on Identity Governance automation.
                </p>
                <p>
                    We recommend immediate deployment of the automated User Access Review (UAR) campaigns to mitigate the 3 critical risks identified in the IAM domain before the Q3 external audit cycle.
                </p>
            </div>

            <div className="mt-auto pt-6 z-10">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                    <span className="text-xs text-slate-500 font-mono">AI Generated · 2 mins ago</span>
                    <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">Share Report</button>
                </div>
            </div>
        </div>
    );
}
