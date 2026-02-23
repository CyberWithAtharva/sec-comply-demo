"use client";

import React from "react";
import { Clock, FileWarning } from "lucide-react";
import { cn } from "@/components/ui/Card";

const stales = [
    { title: "Penetration Test Report", date: "364 days ago", owner: "SecOps", threat: "critical" },
    { title: "Access Review (Q2)", date: "185 days ago", owner: "IT Manager", threat: "high" },
    { title: "BCP/DR Exercise Log", date: "390 days ago", owner: "Compliance", threat: "critical" },
];

export function StaleEvidenceWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Stale Over 180 Days</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                {stales.map((stale, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex flex-col group hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-amber-400 transition-colors">{stale.title}</span>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                stale.threat === "critical" ? "text-red-500" : "text-orange-400"
                            )}>{stale.date}</span>
                        </div>
                        <div className="flex items-center text-[10px] text-slate-500">
                            <FileWarning className="w-3 h-3 mr-1 text-slate-400" />
                            Owner: <span className="text-slate-300 ml-1">{stale.owner}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="text-xs text-amber-500 hover:text-amber-400 mt-4 text-center font-medium transition-colors">
                Request Renewals →
            </button>
        </div>
    );
}
