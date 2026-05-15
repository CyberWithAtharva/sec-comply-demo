"use client";

import React from "react";
import { EyeOff, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const shadowItems = [
    { domain: "omniguard-beta.herokuapp.com", source: "CT Log", date: "Found 2h ago" },
    { domain: "dev-dashboard.omniguard.io", source: "Passive DNS", date: "Found 1d ago" },
    { domain: "omniguard-support.zendesk.com", source: "Referer", date: "Found 3d ago" },
];

export function ShadowDomainWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <EyeOff className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Shadow IT Domains</h3>
                </div>
            </div>

            <div className="flex flex-col space-y-3 flex-1 justify-center">
                <p className="text-xs text-muted-foreground mb-2">Unsanctioned domains detected via cert logs & DNS.</p>
                {shadowItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 flex flex-col group hover:bg-secondary/40 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-foreground group-hover:text-purple-400 transition-colors">{item.domain}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center"><AlertCircle className="w-3 h-3 mr-1 text-purple-500" /> {item.source}</span>
                            <span className="font-mono tracking-widest uppercase">{item.date}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="secondary" className="w-full mt-4 h-auto py-2.5 space-x-2 text-sm">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
                <span>Review Discovered Assets</span>
            </Button>
        </div>
    );
}
