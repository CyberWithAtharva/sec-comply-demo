"use client";

import React from "react";
import { CopyCheck, Activity, Database, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const pipelines = [
    { source: "AWS AWSConfig", metric: "3,204 Assets", status: "active", lastSync: "10m ago" },
    { source: "Okta Identity", metric: "249 Users", status: "active", lastSync: "1h ago" },
    { source: "GitHub Repos", metric: "18 Repos", status: "warning", lastSync: "2d ago" },
    { source: "Jira Ticketing", metric: "API Errored", status: "error", lastSync: "3d ago" },
];

export function EvidencePipelineWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Automated Collection</h3>
                </div>
                <Settings className="w-4 h-4 text-muted-foreground hover:text-muted-foreground cursor-pointer transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {pipelines.map((pipe, idx) => (
                    <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 flex space-x-3 group cursor-pointer hover:bg-secondary/40 transition-colors">
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
                            <span className="text-sm font-medium text-foreground group-hover:text-indigo-400 transition-colors">{pipe.source}</span>
                            <div className="flex items-center justify-between mt-1">
                                <span className={cn(
                                    "text-[10px] font-mono tracking-wider",
                                    pipe.status === "error" ? "text-red-400 font-bold" : "text-muted-foreground"
                                )}>
                                    {pipe.metric}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium">Sync: {pipe.lastSync}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="plain" className="w-full mt-4 h-auto py-2.5 space-x-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-sm font-medium text-indigo-400 hover:text-indigo-400 rounded-lg border border-indigo-500/20">
                <CopyCheck className="w-4 h-4" />
                <span>Connect Integration</span>
            </Button>
        </div>
    );
}
