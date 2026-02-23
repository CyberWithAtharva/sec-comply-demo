"use client";

import React from "react";
import { UserMinus, ShieldBan } from "lucide-react";

export function RevokedAccessWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                    <ShieldBan className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Access Revocations</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center relative z-10 space-y-2">
                <div className="text-5xl font-bold tracking-tighter text-slate-100 flex items-baseline">
                    124<span className="text-sm font-medium text-slate-500 ml-2 tracking-normal">this month</span>
                </div>

                <div className="flex space-x-4 text-xs mt-4">
                    <div className="flex flex-col items-center">
                        <span className="text-emerald-400 font-bold text-lg hover:scale-110 transition-transform">98</span>
                        <span className="text-slate-500 uppercase tracking-widest text-[9px]">Automated</span>
                    </div>
                    <div className="w-px h-8 bg-slate-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-amber-400 font-bold text-lg hover:scale-110 transition-transform">26</span>
                        <span className="text-slate-500 uppercase tracking-widest text-[9px]">Manual</span>
                    </div>
                </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-sm font-medium text-red-400 py-2.5 rounded-lg border border-red-500/20 transition-colors relative z-10">
                <UserMinus className="w-4 h-4" />
                <span>View Revocation Logs</span>
            </button>

            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
