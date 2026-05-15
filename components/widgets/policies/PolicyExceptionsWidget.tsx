"use client";

import React from "react";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const exceptions = [
    { title: "MFA Bypass for Service Acc", owner: "DevOps", expires: "14 days", risk: "high" },
    { title: "Legacy TLS 1.1 Support", owner: "Engineering", expires: "45 days", risk: "critical" },
    { title: "Local Admin Rights (VP)", owner: "IT Support", expires: "90 days", risk: "medium" },
];

export function PolicyExceptionsWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Active Waivers & Exceptions</h3>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pr-1 scrollbar-thin">
                <p className="text-xs text-muted-foreground mb-2 shrink-0">Temporary policy deviations requiring remediation.</p>
                <div className="flex flex-col space-y-3">
                    {exceptions.map((exc, idx) => (
                        <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-foreground group-hover:text-amber-400 transition-colors">{exc.title}</span>
                                <span className={cn(
                                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                                    exc.risk === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        exc.risk === "high" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {exc.risk}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Owner: <span className="font-medium text-muted-foreground">{exc.owner}</span></span>
                                <span className="flex items-center text-amber-400/80"><Clock className="w-3 h-3 mr-1" /> Expires in {exc.expires}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-amber-500 hover:text-amber-400 mt-3 shrink-0 text-center font-medium">
                Review Extension Requests →
            </Button>
        </div>
    );
}
