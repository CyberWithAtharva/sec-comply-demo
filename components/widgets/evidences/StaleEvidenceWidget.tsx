"use client";

import React from "react";
import { Clock, FileWarning } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const stales = [
    { title: "Penetration Test Report", date: "364 days ago", owner: "SecOps", threat: "critical" },
    { title: "Access Review (Q2)", date: "185 days ago", owner: "IT Manager", threat: "high" },
    { title: "BCP/DR Exercise Log", date: "390 days ago", owner: "Compliance", threat: "critical" },
];

export function StaleEvidenceWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Stale Over 180 Days</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                {stales.map((stale, idx) => (
                    <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-foreground group-hover:text-amber-400 transition-colors">{stale.title}</span>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                stale.threat === "critical" ? "text-red-500" : "text-orange-400"
                            )}>{stale.date}</span>
                        </div>
                        <div className="flex items-center text-[10px] text-muted-foreground">
                            <FileWarning className="w-3 h-3 mr-1 text-muted-foreground" />
                            Owner: <span className="text-muted-foreground ml-1">{stale.owner}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-amber-500 hover:text-amber-400 mt-4 text-center font-medium">
                Request Renewals →
            </Button>
        </div>
    );
}
