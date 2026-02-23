"use client";

import React from "react";
import { FileText, Award, AlertTriangle } from "lucide-react";
import { cn } from "@/components/ui/Card";

export function PolicyMaturityWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Governance Maturity</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                        <circle cx="64" cy="64" r="56" className="stroke-indigo-500" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * 88) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-slate-100">Level 4</span>
                        <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-1">Managed</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-start space-x-3 relative z-10">
                <AlertTriangle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-200 leading-relaxed">
                    Next milestone involves continuous monitoring integration for <strong>Level 5 (Optimized)</strong> maturity.
                </p>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
