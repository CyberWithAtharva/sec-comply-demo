"use client";

import React from "react";
import { Sparkles, AlertTriangle, Key } from "lucide-react";
import { cn } from "@/components/ui/Card";

const riskyIdentities = [
    { name: "svc-deployment-prod", type: "Service Account", unusedDays: 45, excess: 12 },
    { name: "John Doe (Contractor)", type: "Human", unusedDays: 14, excess: 3 },
    { name: "Marketing Data Lambda", type: "Role", unusedDays: 90, excess: 24 },
];

export function OverPermissionedWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Over-Permissioned Identities</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">3</div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pr-1 scrollbar-thin">
                <p className="text-xs text-slate-400 mb-2 shrink-0">Identities with unused or excessive privileges detected by AI.</p>
                <div className="flex flex-col space-y-3">
                    {riskyIdentities.map((id, idx) => (
                        <div key={idx} className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 flex flex-col group hover:bg-slate-800/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors truncate">{id.name}</span>
                                <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-bold whitespace-nowrap ml-2">
                                    {id.excess} Excess
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="flex items-center"><Key className="w-3 h-3 mr-1" /> {id.type}</span>
                                <span className="flex items-center text-amber-500/80"><AlertTriangle className="w-3 h-3 mr-1" /> {id.unusedDays}d unused</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full mt-3 shrink-0 flex items-center justify-center space-x-2 text-sm text-cyan-400 py-2.5 rounded-lg border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-colors font-medium">
                <span>View AI Rightsizing Recommendations</span>
            </button>
        </div>
    );
}
