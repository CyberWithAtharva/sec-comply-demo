"use client";

import React from "react";
import { EyeOff, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const shadowApps = [
    { name: "Grammarly", users: 142, risk: "High", usage: "3.2 TB" },
    { name: "Personal Dropbox", users: 56, risk: "Critical", usage: "128 GB" },
    { name: "Canva Pro", users: 89, risk: "Medium", usage: "14 GB" },
];

export function ShadowSaaSWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <EyeOff className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Shadow SaaS Detection</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">12</div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-muted-foreground mb-2">Unsanctioned apps detected via network & SSO logs.</p>
                {shadowApps.map((app, idx) => (
                    <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-foreground group-hover:text-amber-400 transition-colors flex items-center">{app.name} <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                                app.risk === "Critical" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    app.risk === "High" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            )}>
                                {app.risk} Risk
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Detected Users: <span className="font-medium text-muted-foreground">{app.users}</span></span>
                            <span className="flex items-center text-muted-foreground"><AlertTriangle className="w-3 h-3 mr-1" /> {app.usage} Transfer</span>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="secondary" className="w-full mt-4 h-auto py-2.5 space-x-2 text-sm font-medium text-amber-500">
                <EyeOff className="w-4 h-4" />
                <span>Begin App Sanction Workflow</span>
            </Button>
        </div>
    );
}
