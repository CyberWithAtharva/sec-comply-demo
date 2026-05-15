"use client";

import React from "react";
import { Sparkles, AlertTriangle, Key } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const riskyIdentities = [
    { name: "svc-deployment-prod", type: "Service Account", unusedDays: 45, excess: 12 },
    { name: "John Doe (Contractor)", type: "Human", unusedDays: 14, excess: 3 },
    { name: "Marketing Data Lambda", type: "Role", unusedDays: 90, excess: 24 },
];

export function OverPermissionedWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Over-Permissioned Identities</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">3</div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pr-1 scrollbar-thin">
                <p className="text-xs text-muted-foreground mb-2 shrink-0">Identities with unused or excessive privileges detected by AI.</p>
                <div className="flex flex-col space-y-3">
                    {riskyIdentities.map((id, idx) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-foreground group-hover:text-cyan-400 transition-colors truncate">{id.name}</span>
                                <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-bold whitespace-nowrap ml-2">
                                    {id.excess} Excess
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="flex items-center"><Key className="w-3 h-3 mr-1" /> {id.type}</span>
                                <span className="flex items-center text-amber-500/80"><AlertTriangle className="w-3 h-3 mr-1" /> {id.unusedDays}d unused</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button variant="outline" className="w-full mt-3 shrink-0 h-auto py-2.5 space-x-2 text-sm text-cyan-400 hover:border-cyan-500/50 hover:bg-secondary/50 hover:text-cyan-400 font-medium">
                <span>View AI Rightsizing Recommendations</span>
            </Button>
        </div>
    );
}
