"use client";

import React from "react";
import { Target, ShieldAlert, Cpu } from "lucide-react";

export function AssetCriticalityWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Criticality Matrix</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-5">
                {/* Critical */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300 flex items-center"><ShieldAlert className="w-4 h-4 mr-1.5 text-red-500" /> Tier 1: Mission Critical</span>
                        <span className="text-xs font-bold text-red-500">42</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '12%' }} />
                    </div>
                </div>

                {/* High */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300 flex items-center"><Cpu className="w-4 h-4 mr-1.5 text-amber-500" /> Tier 2: Core Infrastructure</span>
                        <span className="text-xs font-bold text-amber-500">186</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                </div>

                {/* Moderate */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-300">Tier 3: Standard Assets</span>
                        <span className="text-xs font-bold text-emerald-500">814</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                </div>
            </div>

            <button className="text-xs text-red-400 hover:text-red-300 mt-6 text-center font-medium transition-colors border-t border-slate-800/50 pt-4 w-full flex items-center justify-center">
                Review Default Security Baselines
            </button>
        </div>
    );
}
