"use client";

import React from "react";
import { CopyCheck, Activity, Database, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/components/ui/Card";

const pipelines = [
    { source: "AWS AWSConfig", metric: "3,204 Assets", status: "active", lastSync: "10m ago" },
    { source: "Okta Identity", metric: "249 Users", status: "active", lastSync: "1h ago" },
    { source: "GitHub Repos", metric: "18 Repos", status: "warning", lastSync: "2d ago" },
    { source: "Jira Ticketing", metric: "API Errored", status: "error", lastSync: "3d ago" },
];

export function EvidencePipelineWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight">Automated Collection</h3>
                </div>
                <Settings className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {pipelines.map((pipe, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex space-x-3 group cursor-pointer hover:bg-slate-800/40 transition-colors">
                        <div className="mt-0.5">
                            {pipe.status === "active" ? (
                                <Database className="w-4 h-4 text-emerald-500" />
                            ) : pipe.status === "warning" ? (
                                <Activity className="w-4 h-4 text-amber-500" />
                            ) : (
                                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">{pipe.source}</span>
                            <div className="flex items-center justify-between mt-1">
                                <span className={cn(
                                    "text-[10px] font-mono tracking-wider",
                                    pipe.status === "error" ? "text-red-400 font-bold" : "text-slate-500"
                                )}>
                                    {pipe.metric}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">Sync: {pipe.lastSync}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-sm font-medium text-indigo-400 py-2.5 rounded-lg border border-indigo-500/20 transition-colors">
                <CopyCheck className="w-4 h-4" />
                <span>Connect Integration</span>
            </button>
        </div>
    );
}
